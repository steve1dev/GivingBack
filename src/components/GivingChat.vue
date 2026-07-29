<template>
  <!-- Root: fixed, full-viewport, transparent. The transform here creates a new
       "containing block" for its position:fixed children, so translating this
       root is what actually drags the button + chat window around the screen. -->
  <div id="giving-chat-root" :style="rootStyle">
    <!-- Floating button -->
    <button
      class="chat-fab"
      id="fab"
      ref="fabEl"
      title="Drag to move · Click to open"
      @pointerdown="onFabPointerDown"
    >
      <span v-if="!isOpen" class="fab-icon" v-html="ICONS.leaf"></span>
      <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
        <line x1="2" y1="2" x2="16" y2="16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="16" y1="2" x2="2" y2="16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Chat window -->
    <div id="chat-wrapper" ref="chatWrapperEl" :class="{ open: isOpen }">
      <div
        id="chat-header"
        title="Drag to move · Double-click to reset position"
        @pointerdown="onHeaderPointerDown"
        @dblclick="resetPosition"
      >
        <div class="avatar-wrap">
          <div class="avatar-circle" v-html="ICONS.leaf"></div>
          <div class="online-dot"></div>
        </div>
        <div class="header-info">
          <h2>GivingChat</h2>
          <p>Giving Back Assistant · Online</p>
        </div>
        <div class="drag-grip" aria-hidden="true">⠿</div>
      </div>

      <div id="messages" ref="messagesEl">
        <div class="msg bot">
          <div class="msg-avatar" v-html="ICONS.leaf"></div>
          <div class="bubble">
            <p>Hi! I'm GivingChat. Welcome to Giving Back, the platform where recycling pays off. Here's how it works:</p>
            <ol class="bubble-steps">
              <li>Sign up for free and join the community.</li>
              <li>Gather your materials and take them to a recycling point.</li>
              <li>Earn Giving Points for every material you recycle.</li>
              <li>Redeem your points for gift cards or discounts.</li>
            </ol>
            <p>How can I help you?</p>
          </div>
        </div>

        <div v-for="(msg, i) in messages" :key="i" :class="['msg', msg.role]">
          <div class="msg-avatar" v-html="msg.role === 'bot' ? ICONS.leaf : ICONS.user"></div>
          <div class="bubble" v-html="msg.text"></div>
        </div>

        <div class="msg bot" v-if="loading">
          <div class="msg-avatar" v-html="ICONS.leaf"></div>
          <div class="bubble">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>

      <div id="quick-btns">
        <button class="quick-btn" @click="sendQuick('What is Giving Back?')">What is it?</button>
        <button class="quick-btn" @click="sendQuick('How do Giving Points work?')">Giving Points</button>
        <button class="quick-btn" @click="sendQuick('Where can I recycle?')">Where to recycle?</button>
        <button class="quick-btn" @click="sendQuick('What is the circular economy and how is Giving Back part of it?')">Circular economy</button>
        <button class="quick-btn" @click="sendQuick('How can I contact Giving Back?')">Contact</button>
      </div>

      <div id="chat-input-row">
        <input
          v-model="userInput"
          @keydown.enter="sendMessage"
          placeholder="Type your question..."
          :disabled="loading"
        />
        <button id="send-btn" @click="sendMessage" :disabled="loading" aria-label="Send message" v-html="ICONS.send"></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'

const ICONS = {
  leaf: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>',
  user: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
  send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
}

const isOpen = ref(false)
const userInput = ref('')
const messages = ref([])
const loading = ref(false)
const messagesEl = ref(null)

const toggleChat = () => { isOpen.value = !isOpen.value }

/* ---------------------------------------------------------------
   DRAG LOGIC
   The button and the chat window still use position:fixed with
   their original styles (bottom/right), but they live inside a
   root container to which we apply "transform: translate(...)".
   A transform on an ancestor turns that ancestor into the
   "containing block" for its position:fixed children, so moving
   the root's transform moves the button and the window together,
   without having to touch any of their original positioning rules.
--------------------------------------------------------------- */
const fabEl = ref(null)
const chatWrapperEl = ref(null)
const dragOffset = ref({ x: 0, y: 0 })

let dragging = false
let dragTarget = null   // 'fab' | 'header'
let moved = false
let startX = 0
let startY = 0
let originX = 0
let originY = 0
let baseRect = null

const rootStyle = computed(() => ({
  position: 'fixed',
  inset: '0',
  pointerEvents: 'none',
  transform: `translate(${dragOffset.value.x}px, ${dragOffset.value.y}px)`,
  zIndex: 1000
}))

const beginDrag = (e, target) => {
  if (e.button !== undefined && e.button !== 0) return // primary click/touch only
  dragging = true
  dragTarget = target
  moved = false
  startX = e.clientX
  startY = e.clientY
  originX = dragOffset.value.x
  originY = dragOffset.value.y

  const el = target === 'header' ? chatWrapperEl.value : fabEl.value
  baseRect = el ? el.getBoundingClientRect() : null

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

const onFabPointerDown = (e) => beginDrag(e, 'fab')
const onHeaderPointerDown = (e) => beginDrag(e, 'header')

const onPointerMove = (e) => {
  if (!dragging) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true

  let newX = originX + dx
  let newY = originY + dy

  if (baseRect) {
    const margin = 4
    const unshiftedLeft = baseRect.left - originX
    const unshiftedTop = baseRect.top - originY

    const minX = margin - unshiftedLeft
    const maxX = window.innerWidth - unshiftedLeft - baseRect.width - margin
    const minY = margin - unshiftedTop
    const maxY = window.innerHeight - unshiftedTop - baseRect.height - margin

    newX = Math.min(Math.max(newX, Math.min(minX, maxX)), Math.max(minX, maxX))
    newY = Math.min(Math.max(newY, Math.min(minY, maxY)), Math.max(minY, maxY))
  }

  dragOffset.value = { x: newX, y: newY }
}

const onPointerUp = () => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  if (!moved && dragTarget === 'fab') {
    toggleChat()
  }
  dragging = false
  dragTarget = null
  baseRect = null
}

const resetPosition = () => {
  dragOffset.value = { x: 0, y: 0 }
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})
/* --------------------------------------------------------------- */

const greetings = ['hello', 'hi', 'hey', 'yo', 'good morning', 'good afternoon', 'good evening', 'greetings', "what's up", 'sup']

const responses = {
  points: `Giving Points are the points you earn every time you recycle materials.<br><br>Depending on how many points you build up, you can redeem them for:<br><br><strong>Discounts at partner stores</strong><br><br>Appliances earn more points, cardboard a bit less. You decide how to build them up!`,
  contact: `You can reach us through any of these channels:<br><br>Instagram: <strong>@giving_back</strong><br>Email: <strong>givingback2025@gmail.com</strong><br><br>We're here to help you!`,
  economy: `The circular economy is a model that aims to reduce waste by giving materials a second life instead of throwing them away.<br><br>Giving Back is part of this because it connects people who have materials like cardboard, plastic, glass, or appliances with those who can reuse them.<br><br>And the best part is you earn Giving Points for every material you recycle, helping the planet and getting rewards at the same time.`,
  whereToRecycle: `You can take your materials to the nearest DollarCity stores.<br><br>On the platform's map you can see which store is close to where you live and drop off your materials there as a meeting point. Easy and convenient!`,
  whatIsIt: `Giving Back is a web platform where people can recycle or acquire materials like cardboard, metal, plastic, glass, and appliances.<br><br>Our goal is to drive the circular economy, giving materials a second life and connecting those who want to recycle with those who need them.`
}

const scrollDown = () => {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}

const sendQuick = (text) => {
  userInput.value = text
  sendMessage()
}

const sendMessage = () => {
  const text = userInput.value.trim()
  if (!text || loading.value) return
  userInput.value = ''
  loading.value = true

  messages.value.push({ role: 'user', text })
  scrollDown()

  setTimeout(() => {
    const t = text.toLowerCase()
    const isGreeting = greetings.some(g => t.includes(g))
    let reply = ''

    if (isGreeting) {
      reply = `Welcome to Giving Back! I'm glad you're here. I'm GivingChat, your personal recycling assistant.<br><br>I'm here to help you with everything you need to know about our platform, Giving Points, where to recycle, and much more. How can I help you today?`
    } else if (t.includes('point') || t.includes('giving point') || t.includes('redeem') || t.includes('reward') || t.includes('gift') || t.includes('discount')) {
      reply = responses.points
    } else if (t.includes('contact') || t.includes('instagram') || t.includes('email') || t.includes('e-mail') || t.includes('reach')) {
      reply = responses.contact
    } else if (t.includes('econom') || t.includes('circular') || t.includes('environment') || t.includes('planet') || t.includes('sustainab')) {
      reply = responses.economy
    } else if (t.includes('where') || t.includes('take') || t.includes('drop off') || t.includes('dollarcity') || t.includes('map') || t.includes('recycl')) {
      reply = responses.whereToRecycle
    } else if (t.includes('what is') || t.includes("what's") || t.includes('giving back') || t.includes('platform') || t.includes('website')) {
      reply = responses.whatIsIt
    } else {
      reply = `Good question! At Giving Back we work to make recycling easy and rewarding. If you'd like to know more, write to us at <strong>givingback2025@gmail.com</strong> or follow us on Instagram as <strong>@giving_back</strong>`
    }

    messages.value.push({ role: 'bot', text: reply })
    loading.value = false
    scrollDown()
  }, 800)
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.chat-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #1d5c049d;
  color: #fff;
  font-size: 26px;
  border: none;
  cursor: grab;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
  pointer-events: auto;
  touch-action: none;
  user-select: none;
}
.chat-fab:hover { background: #1a4a1a; transform: translateY(-2px) scale(1.04); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
.chat-fab:active { cursor: grabbing; transform: translateY(0) scale(0.96); }
.chat-fab svg { width: 26px; height: 26px; }
.fab-icon { display: flex; align-items: center; justify-content: center; }

#chat-wrapper {
  position: fixed;
  bottom: 100px;
  right: 28px;
  width: 370px;
  height: 580px;
  max-height: calc(100vh - 120px);
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  display: none;
  flex-direction: column;
  z-index: 999;
  border: 1px solid #c8e6d4;
  pointer-events: auto;
}
#chat-wrapper.open { display: flex; animation: slideUp 0.25s ease; }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

#chat-header {
  background: linear-gradient(135deg, #0D2B0D, #1a4a1a);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  cursor: grab;
  touch-action: none;
  user-select: none;
}
#chat-header:active { cursor: grabbing; }
.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar-circle {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: #ffffff22;
  border: 2px solid #ffffff44;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  color: #fff;
}
.avatar-circle svg { width: 22px; height: 22px; }
.online-dot {
  position: absolute;
  bottom: 1px; right: 1px;
  width: 11px; height: 11px;
  background: #4cde80;
  border-radius: 50%;
  border: 2px solid #0D2B0D;
}
.header-info { flex: 1; min-width: 0; }
.header-info h2 { font-size: 15px; font-weight: 700; color: #fff; }
.header-info p { font-size: 11px; color: #ffffffaa; margin-top: 1px; }
.drag-grip {
  color: #ffffff66;
  font-size: 16px;
  flex-shrink: 0;
  letter-spacing: -2px;
}

#messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #F5F0E8;
}
.msg { display: flex; gap: 8px; max-width: 88%; animation: msg-in 0.25s ease; }
.msg.user { align-self: flex-end; flex-direction: row-reverse; }
.msg.bot { align-self: flex-start; }
@keyframes msg-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.msg-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #d4edda;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  color: #0D2B0D;
  flex-shrink: 0;
  margin-top: 2px;
}
.msg-avatar svg { width: 14px; height: 14px; }
.msg.user .msg-avatar { background: #0D2B0D; color: #fff; font-size: 12px; }
.bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.6;
  color: #1a1a1a;
}
.bubble p { margin: 0 0 8px; }
.bubble p:last-child { margin-bottom: 0; }
.bubble-steps {
  list-style: none;
  counter-reset: step;
  margin: 2px 0 10px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.bubble-steps li {
  counter-increment: step;
  position: relative;
  padding-left: 26px;
}
.bubble-steps li::before {
  content: counter(step);
  position: absolute;
  left: 0; top: 0.5px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #0D2B0D;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.msg.bot .bubble {
  background: #fff;
  border: 1px solid #e0f0e5;
  border-top-left-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.msg.user .bubble {
  background: #0D2B0D;
  color: #fff;
  border-top-right-radius: 4px;
}

.dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #0D2B0D; display: inline-block;
  animation: bounce 1.2s infinite; margin: 0 2px;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }

#quick-btns {
  padding: 8px 12px 6px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  background: #fff;
  border-top: 1px solid #eaf4ed;
  flex-shrink: 0;
}
.quick-btn {
  font-size: 11.5px;
  padding: 5px 11px;
  border-radius: 20px;
  border: 1.5px solid #0D2B0D;
  background: transparent;
  color: #0D2B0D;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
  font-family: inherit;
  font-weight: 500;
}
.quick-btn:hover { background: #0D2B0D; color: #fff; transform: translateY(-1px); }
.quick-btn:active { transform: translateY(0) scale(0.96); }

#chat-input-row {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid #eaf4ed;
  background: #fff;
  flex-shrink: 0;
}
#chat-input-row input {
  flex: 1;
  padding: 9px 14px;
  border-radius: 24px;
  border: 1.5px solid #c8e6d4;
  background: #f4f9f6;
  font-size: 13px;
  font-family: inherit;
  color: #1a1a1a;
  outline: none;
  transition: border 0.15s;
}
#chat-input-row input:focus { border-color: #0D2B0D; }
#send-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: #0D2B0D;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  font-size: 16px;
  flex-shrink: 0;
  transition: background 0.15s ease, transform 0.15s ease;
}
#send-btn svg { width: 16px; height: 16px; }
#send-btn:hover:not(:disabled) { background: #1a4a1a; transform: scale(1.06); }
#send-btn:active:not(:disabled) { transform: scale(0.94); }
#send-btn:disabled { background: #9cc4b0; cursor: not-allowed; }

/* On narrow screens, the window shouldn't overflow the viewport */
@media (max-width: 420px) {
  #chat-wrapper { width: calc(100vw - 24px); right: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  #chat-wrapper.open { animation: none; }
  .msg { animation: none; }
  .chat-fab, .quick-btn, #send-btn { transition: none; }
  .chat-fab:hover, .chat-fab:active,
  .quick-btn:hover, .quick-btn:active,
  #send-btn:hover, #send-btn:active { transform: none; }
}
</style>