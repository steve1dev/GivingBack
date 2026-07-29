<template>
  <the-navbar />
  <div class="app">

    <!-- ═══════════════════════════════════════════════
         SCREEN: HOME (Environmental Education)
    ═══════════════════════════════════════════════ -->
    <div v-if="screen === 'home'" class="page home-page">
      <div class="hdr home-hdr">
        <div class="logo"><span class="g">GIVING</span> BACK</div>
        <div class="marn-pill">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8FE58F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>
          <span>In partnership with <strong>MARN</strong></span>
        </div>
      </div>

      <section class="hero">
        <svg class="hero-decor" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true">
          <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/>
          <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/>
          <path d="m14 16-3 3 3 3"/>
          <path d="M8.293 13.596 4.875 9.5 8.293 5.404"/>
          <path d="m7.9 9.5 4.5.001"/>
          <path d="M16 9.5h.001"/>
          <path d="m19.128 13.596-3.418 4.096"/>
        </svg>
        <p class="eyebrow">ENVIRONMENTAL EDUCATION · EL SALVADOR</p>
        <h1 class="hero-title">Learn to recycle and <span class="hl">transform</span> your community</h1>
        <p class="hero-sub">
          Together with the Ministry of Environment and Natural Resources (MARN) we teach
          you what recycling is, how to practice it every day, and how the circular
          economy helps us build a more sustainable future.
        </p>
        <div class="hero-actions">
          <button class="btn-primary" @click="goToTopic(topics[1])">I want to learn to recycle</button>
          <button class="btn-ghost" @click="startQuiz">Test yourself</button>
        </div>
      </section>

      <p class="cat-lbl">EXPLORE THE TOPICS</p>
      <div class="cat-grid">
        <div
          v-for="topic in topics"
          :key="topic.id"
          class="cat-card"
          @click="goToTopic(topic)"
        >
          <div class="cat-icon" v-html="topic.svg" />
          <span class="cat-name">{{ topic.name }}</span>
          <span class="cat-tag">{{ topic.tagline }}</span>
          <div class="cat-arrow">›</div>
        </div>
      </div>

      <p class="marn-note">
        Educational initiative developed with the support of the Ministry of Environment
        and Natural Resources of El Salvador.
      </p>
    </div>

    <!-- ═══════════════════════════════════════════════
         SCREEN: TOPIC (Educational content)
    ═══════════════════════════════════════════════ -->
    <div v-else-if="screen === 'topic'" class="page topic-page">
      <div class="hdr">
        <button class="back-btn" @click="screen = 'home'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="logo"><span class="g">GIVING</span> BACK</div>
        <button class="quiz-btn" @click="startQuiz">Quiz</button>
      </div>

      <div class="topic-hero">
        <div class="topic-hero-icon" v-html="currentTopic.svg" />
        <div class="topic-hero-txt">
          <p class="topic-eyebrow">{{ currentTopic.tagline }}</p>
          <h1 class="topic-title">{{ currentTopic.name }}</h1>
          <p class="topic-intro">{{ currentTopic.intro }}</p>
        </div>
      </div>

      <template v-for="(sec, si) in currentTopic.sections" :key="si">

        <!-- Info cards -->
        <section v-if="sec.type === 'cards'" class="sec">
          <h2 class="sec-title">{{ sec.title }}</h2>
          <div class="info-grid">
            <div v-for="(it, i) in sec.items" :key="i" class="info-card">
              <div class="info-emoji" v-html="it.icon"></div>
              <h3 class="info-title">{{ it.title }}</h3>
              <p class="info-text">{{ it.text }}</p>
            </div>
          </div>
        </section>

        <!-- Numbered steps -->
        <section v-else-if="sec.type === 'steps'" class="sec">
          <h2 class="sec-title">{{ sec.title }}</h2>
          <div class="steps">
            <div v-for="(st, i) in sec.items" :key="i" class="step-row">
              <div class="step-num">{{ i + 1 }}</div>
              <div class="step-body">
                <h3 class="step-title">{{ st.title }}</h3>
                <p class="step-text">{{ st.text }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Material guide (yes / no) -->
        <section v-else-if="sec.type === 'materials'" class="sec">
          <h2 class="sec-title">{{ sec.title }}</h2>
          <div class="mat-grid">
            <div v-for="(m, i) in sec.items" :key="i" class="mat-card">
              <div class="mat-icon" v-html="m.svg" />
              <h3 class="mat-name">{{ m.name }}</h3>
              <div class="mat-list ok">
                <span class="mat-lbl">Yes ✓</span>
                <p>{{ m.ok.join(' · ') }}</p>
              </div>
              <div class="mat-list bad">
                <span class="mat-lbl">No ✕</span>
                <p>{{ m.bad.join(' · ') }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Linear vs circular comparison -->
        <section v-else-if="sec.type === 'compare'" class="sec">
          <h2 class="sec-title">{{ sec.title }}</h2>
          <div class="compare">
            <div class="cmp-col linear">
              <h3 class="cmp-title">{{ sec.linear.title }}</h3>
              <div class="cmp-chain">
                <template v-for="(s, i) in sec.linear.steps" :key="i">
                  <span class="cmp-chip">{{ s }}</span>
                  <span v-if="i < sec.linear.steps.length - 1" class="cmp-arrow">→</span>
                </template>
              </div>
              <p class="cmp-text">{{ sec.linear.text }}</p>
            </div>
            <div class="cmp-col circular">
              <h3 class="cmp-title">{{ sec.circular.title }}</h3>
              <div class="cmp-chain">
                <template v-for="(s, i) in sec.circular.steps" :key="i">
                  <span class="cmp-chip">{{ s }}</span>
                  <span v-if="i < sec.circular.steps.length - 1" class="cmp-arrow">⟳</span>
                </template>
              </div>
              <p class="cmp-text">{{ sec.circular.text }}</p>
            </div>
          </div>
        </section>

        <!-- Circular diagram of the 5Rs -->
        <section v-else-if="sec.type === 'loop'" class="sec">
          <h2 class="sec-title">{{ sec.title }}</h2>
          <div class="loop-wrap">
            <div class="loop">
              <div class="loop-ring" />
              <div v-for="(chip, i) in sec.chips" :key="i" :class="['loop-chip', 'lc' + (i + 1)]">
                {{ chip }}
              </div>
              <div class="loop-center">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#8FE58F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>
                <span>5R</span>
              </div>
            </div>
            <p class="loop-note">{{ sec.note }}</p>
          </div>
        </section>

        <!-- Highlighted fact -->
        <section v-else-if="sec.type === 'fact'" class="sec">
          <div class="fact-band">
            <span class="fact-emoji" v-html="sec.icon"></span>
            <p class="fact-text">{{ sec.text }}</p>
          </div>
        </section>

      </template>

      <div class="topic-nav">
        <button class="btn-ghost dark-ghost" @click="screen = 'home'">‹ Back to topics</button>
        <button class="btn-primary" @click="goToTopic(nextTopic)">
          Next: {{ nextTopic.name }} ›
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════
         SCREEN: QUIZ (Awareness)
    ═══════════════════════════════════════════════ -->
    <div v-else-if="screen === 'quiz'" class="page quiz-page">
      <div class="hdr">
        <button class="back-btn dark" @click="screen = 'home'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="logo on-dark"><span class="g">GIVING</span> BACK</div>
        <div class="score-pill">
          <span>{{ score }}</span>
          <img src="/assets/img/givingPoint.png" alt="Giving Point" class="gp-icon" style="width:23px;height:23px" />
        </div>
      </div>

      <!-- Active question -->
      <div v-if="!quizDone" class="quiz-body">
        <div class="q-progress">
          <div class="q-progress-fill" :style="{ width: progressPct + '%' }" />
        </div>
        <p class="q-count">Question {{ qIndex + 1 }} of {{ quiz.length }}</p>
        <h2 class="q-text">{{ currentQuestion.q }}</h2>

        <div class="q-options">
          <button
            v-for="(opt, i) in currentQuestion.options"
            :key="i"
            class="q-opt"
            :class="{
              correct: answered && i === currentQuestion.correct,
              wrong: answered && i === selected && i !== currentQuestion.correct,
              dim: answered && i !== currentQuestion.correct && i !== selected,
            }"
            :disabled="answered"
            @click="selectOption(i)"
          >
            <span class="q-letter">{{ 'ABCD'[i] }}</span>
            <span>{{ opt }}</span>
          </button>
        </div>

        <transition name="fade">
          <div v-if="answered" class="q-feedback" :class="selected === currentQuestion.correct ? 'good' : 'oops'">
            <strong>{{ selected === currentQuestion.correct ? 'Correct!' : 'Almost…' }}</strong>
            <p>{{ currentQuestion.explain }}</p>
            <button class="btn-redeem" @click="nextQuestion">
              {{ qIndex === quiz.length - 1 ? 'See my result' : 'Next question ›' }}
            </button>
          </div>
        </transition>
      </div>

      <!-- Final result -->
      <div v-else class="quiz-result">
        <div class="result-circle">
          <span class="result-score">{{ score }}/{{ quiz.length }}</span>
        </div>
        <div class="result-icon" v-html="resultMessage.icon"></div>
        <h2 class="result-title">{{ resultMessage.title }}</h2>
        <p class="result-text">{{ resultMessage.text }}</p>
        <div class="result-actions">
          <button class="btn-redeem" @click="startQuiz">Try again</button>
          <button class="btn-clear" @click="screen = 'home'">Back to topics</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
// ════════════════════════════════════════════════════════════
//  GIVING BACK · Learn — Composition API
//  Educational module on recycling and the circular economy
//  In partnership with MARN (Ministry of Environment and
//  Natural Resources of El Salvador).
// ════════════════════════════════════════════════════════════
import { ref, computed } from 'vue'
import TheNavbar from '../components/TheNavbar.vue'

/* ── Navigation ── */
const screen = ref('home')          // 'home' | 'topic' | 'quiz'
const currentTopic = ref(null)

/* ── SVG icons (same line style as GivingBack) ── */
const ICONS = {
  queEs: `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
    <circle cx="34" cy="32" r="18" fill="#ffffff" stroke="#0D2B0D" stroke-width="3"/>
    <path d="M34 22c-6 3-8 9-5 14 6 1 11-3 12-10-2-3-4-4-7-4z" fill="#8FE58F" stroke="#0D2B0D" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M29 36c3-5 8-8 12-9" stroke="#0D2B0D" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="47" y1="45" x2="58" y2="56" stroke="#0D2B0D" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  como: `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
    <rect x="18" y="12" width="36" height="48" rx="5" fill="#ffffff" stroke="#0D2B0D" stroke-width="3"/>
    <rect x="28" y="7" width="16" height="10" rx="3" fill="#8FE58F" stroke="#0D2B0D" stroke-width="3"/>
    <path d="M25 30l4 4 7-8" stroke="#0D2B0D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="40" y1="31" x2="49" y2="31" stroke="#8FE58F" stroke-width="3" stroke-linecap="round"/>
    <path d="M25 45l4 4 7-8" stroke="#0D2B0D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="40" y1="46" x2="49" y2="46" stroke="#8FE58F" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  circular: `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
    <path d="M20 26a20 20 0 0 1 34 6" stroke="#0D2B0D" stroke-width="4" stroke-linecap="round"/>
    <path d="M52 46a20 20 0 0 1-34-6" stroke="#8FE58F" stroke-width="4" stroke-linecap="round"/>
    <path d="M54 22v11h-11" stroke="#0D2B0D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 50V39h11" stroke="#8FE58F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="36" cy="36" r="6" fill="#8FE58F" stroke="#0D2B0D" stroke-width="3"/>
  </svg>`,
  sostenible: `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
    <path d="M14 52c8-4 36-4 44 0-4 8-14 12-22 12S18 60 14 52z" fill="#ffffff" stroke="#0D2B0D" stroke-width="3" stroke-linejoin="round"/>
    <path d="M36 50V30" stroke="#0D2B0D" stroke-width="3" stroke-linecap="round"/>
    <path d="M36 34c-10 1-15-5-16-13 9-1 15 4 16 13z" fill="#8FE58F" stroke="#0D2B0D" stroke-width="3" stroke-linejoin="round"/>
    <path d="M36 28c8 1 13-3 14-11-8-1-13 3-14 11z" fill="#ffffff" stroke="#0D2B0D" stroke-width="3" stroke-linejoin="round"/>
  </svg>`,
  papel: `<svg width="60" height="60" viewBox="0 0 72 72" fill="none">
    <rect x="16" y="14" width="34" height="44" rx="4" fill="#EAF6EA" stroke="#0D2B0D" stroke-width="3"/>
    <rect x="24" y="20" width="34" height="44" rx="4" fill="#ffffff" stroke="#0D2B0D" stroke-width="3"/>
    <line x1="31" y1="32" x2="51" y2="32" stroke="#8FE58F" stroke-width="3" stroke-linecap="round"/>
    <line x1="31" y1="40" x2="51" y2="40" stroke="#0D2B0D" stroke-width="3" stroke-linecap="round"/>
    <line x1="31" y1="48" x2="45" y2="48" stroke="#0D2B0D" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  plastico: `<svg width="60" height="60" viewBox="0 0 72 72" fill="none">
    <rect x="30" y="8" width="12" height="8" rx="2" fill="#8FE58F" stroke="#0D2B0D" stroke-width="3"/>
    <path d="M30 16 h12 v6 c6 4 8 8 8 16 v14 c0 4 -3 6 -6 6 H28 c-3 0 -6 -2 -6 -6 V38 c0 -8 2 -12 8 -16 Z" fill="#ffffff" stroke="#0D2B0D" stroke-width="3" stroke-linejoin="round"/>
    <line x1="28" y1="40" x2="44" y2="40" stroke="#8FE58F" stroke-width="3" stroke-linecap="round"/>
    <line x1="28" y1="48" x2="44" y2="48" stroke="#8FE58F" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  latas: `<svg width="60" height="60" viewBox="0 0 72 72" fill="none">
    <path d="M20 18 v36 c0 3 7 6 16 6 s16 -3 16 -6 V18" fill="#ffffff" stroke="#0D2B0D" stroke-width="3"/>
    <ellipse cx="36" cy="18" rx="16" ry="6" fill="#8FE58F" stroke="#0D2B0D" stroke-width="3"/>
    <line x1="26" y1="30" x2="26" y2="48" stroke="#8FE58F" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  organico: `<svg width="60" height="60" viewBox="0 0 72 72" fill="none">
    <path d="M18 40c0 12 8 20 18 20s18-8 18-20H18z" fill="#ffffff" stroke="#0D2B0D" stroke-width="3" stroke-linejoin="round"/>
    <path d="M36 38c-9 1-14-4-15-12 8-1 14 4 15 12z" fill="#8FE58F" stroke="#0D2B0D" stroke-width="3" stroke-linejoin="round"/>
    <path d="M36 38c2-7 7-10 14-10-1 7-6 11-14 10z" fill="#EAF6EA" stroke="#0D2B0D" stroke-width="3" stroke-linejoin="round"/>
  </svg>`,
}

/* ── Small line icons for info-cards / facts (replace emoji, same visual language) ── */
const svgWrap = (inner) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`

const CARD_ICONS = {
  wave: svgWrap('<path d="M1 7q3-4 6 0t6 0t6 0t6 0"/><path d="M1 13q3-4 6 0t6 0t6 0t6 0"/><path d="M1 19q3-4 6 0t6 0t6 0t6 0"/>'),
  tree: svgWrap('<circle cx="12" cy="9" r="6"/><path d="M12 15v6"/>'),
  briefcase: svgWrap('<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/>'),
  shield: svgWrap('<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5Z"/>'),
  chart: svgWrap('<path d="M3 3v18h18"/><rect x="7" y="13" width="3" height="5"/><rect x="12" y="9" width="3" height="9"/><rect x="17" y="6" width="3" height="12"/>'),
  bulb: svgWrap('<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1v.2h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/>'),
  bag: svgWrap('<path d="M6 8h12l-1 12H7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
  wrench: svgWrap('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2Z"/>'),
  loop: svgWrap('<path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 4.875 9.5 8.293 5.404"/><path d="m7.9 9.5 4.5.001"/><path d="M16 9.5h.001"/><path d="m19.128 13.596-3.418 4.096"/>'),
  tote: svgWrap('<rect x="4" y="9" width="16" height="12" rx="2"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/>'),
  bottle: svgWrap('<path d="M9 2h6v3.2c0 .5.2.9.5 1.3l1 1.2c.6.7 1 1.6 1 2.6V19a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3V10.3c0-1 .4-1.9 1-2.6l1-1.2c.3-.4.5-.8.5-1.3V2Z"/><path d="M9 2h6"/>'),
  sprout: svgWrap('<path d="M12 21V10"/><path d="M12 10C7 10 5 7 5 4c5 0 7 2 7 6Z"/><path d="M12 10c5 0 7-3 7-6-5 0-7 2-7 6Z"/>'),
  basket: svgWrap('<path d="M4 10h16l-1.5 9a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7Z"/><path d="M8 10 9 4"/><path d="M16 10l-1-6"/><path d="M4 14h16"/>'),
  drop: svgWrap('<path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13Z"/>'),
  gift: svgWrap('<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18"/><path d="M12 8v13"/><path d="M12 8C9 8 8 6.5 8 5a2.5 2.5 0 0 1 4-2c1 1 1 3 0 5Z"/><path d="M12 8c3 0 4-1.5 4-3a2.5 2.5 0 0 0-4-2c-1 1-1 3 0 5Z"/>'),
  pin: svgWrap('<path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/>'),
  trophy: svgWrap('<path d="M8 4h8v6a4 4 0 0 1-8 0Z"/><path d="M8 5H4v2a4 4 0 0 0 4 4"/><path d="M16 5h4v2a4 4 0 0 1-4 4"/><path d="M12 14v3"/><path d="M9 21h6"/><path d="M10 17h4l.5 4h-5Z"/>'),
  leaf: svgWrap('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>'),
}

/* ── Educational content ── */
const topics = [
  {
    id: 'que-es',
    name: 'What is recycling?',
    tagline: 'Basic concepts',
    svg: ICONS.queEs,
    intro:
      'Recycling is the process of transforming waste into new products or raw materials, reducing the consumption of natural resources, energy use, and pollution of air, water, and soil.',
    sections: [
      {
        type: 'cards',
        title: 'Why is it so important?',
        items: [
          { icon: CARD_ICONS.wave, title: 'Reduces pollution', text: 'Every material you recycle keeps it from ending up in rivers, streams, beaches, or open-air dumps.' },
          { icon: CARD_ICONS.tree, title: 'Saves natural resources', text: 'Recycling paper saves trees and water; recycling aluminum saves nearly 95% of the energy compared to producing it from scratch.' },
          { icon: CARD_ICONS.briefcase, title: 'Creates green jobs', text: 'The recycling chain creates opportunities for collectors, cooperatives, and Salvadoran businesses.' },
          { icon: CARD_ICONS.shield, title: 'Protects our ecosystems', text: 'Less waste means less pressure on the Lempa River, the mangroves, and the country\'s protected natural areas.' },
        ],
      },
      {
        type: 'fact',
        icon: CARD_ICONS.chart,
        text: 'El Salvador generates thousands of tons of solid waste every day. According to MARN, a large portion of it could be recycled or composted instead of ending up in a landfill.',
      },
    ],
  },
  {
    id: 'como',
    name: 'How to recycle?',
    tagline: 'Practical guide',
    svg: ICONS.como,
    intro:
      'Recycling well starts at home. With these five steps, your materials arrive clean and sorted at collection points, ready for a second life.',
    sections: [
      {
        type: 'steps',
        title: 'Step by step from your home',
        items: [
          { title: 'Sort at the source', text: 'Use separate bins for organic waste, recyclables, and what can\'t be reused. Sorting afterward is much harder.' },
          { title: 'Clean and dry', text: 'Rinse bottles, cans, and containers. A dirty material can contaminate a whole batch of recyclables.' },
          { title: 'Compact it', text: 'Crush bottles and cans, and flatten cardboard boxes. They take up less space and are easier to transport.' },
          { title: 'Sort by material', text: 'Group paper and cardboard, plastics, and cans separately, just as Giving Back receives them.' },
          { title: 'Drop off at the right place', text: 'Take them to Giving Back collection points, municipal collection days, or recycling centers authorized by MARN.' },
        ],
      },
      {
        type: 'materials',
        title: 'Quick guide by material',
        items: [
          { name: 'Paper and cardboard', svg: ICONS.papel, ok: ['Boxes', 'Notebooks', 'Newspaper', 'Bond paper', 'Magazines'], bad: ['Waxed paper', 'Dirty napkins', 'Laminated paper'] },
          { name: 'Plastic', svg: ICONS.plastico, ok: ['PET bottles', 'Shampoo containers', 'Crates and buckets'], bad: ['Metallic snack bags', 'Styrofoam', 'Dirty straws'] },
          { name: 'Cans', svg: ICONS.latas, ok: ['Aluminum cans', 'Clean tin cans'], bad: ['Aerosols with contents', 'Cans with paint residue'] },
          { name: 'Organic', svg: ICONS.organico, ok: ['Fruit and vegetable peels', 'Yard waste', 'Coffee grounds (compost it!)'], bad: ['Meat and dairy in home composting', 'Used oil'] },
        ],
      },
      {
        type: 'fact',
        icon: CARD_ICONS.bulb,
        text: 'Golden rule: if a container is clean and dry, it can almost always be recycled. If you\'re unsure, check MARN\'s guides or ask at your nearest collection point.',
      },
    ],
  },
  {
    id: 'circular',
    name: 'Circular economy',
    tagline: 'Rethinking consumption',
    svg: ICONS.circular,
    intro:
      'The circular economy is a model that aims to keep products, materials, and resources in use for as long as possible, generating minimal waste. It is the opposite of the linear "use and throw away" model.',
    sections: [
      {
        type: 'compare',
        title: 'Linear model vs. circular model',
        linear: {
          title: 'Linear economy',
          steps: ['Extract', 'Produce', 'Use', 'Discard'],
          text: 'Resources are extracted, used once, and end up as trash. It depletes nature and fills landfills.',
        },
        circular: {
          title: 'Circular economy',
          steps: ['Design', 'Use', 'Reuse', 'Regenerate'],
          text: 'Materials return to the cycle again and again: they are repaired, reused, and recycled. Waste almost disappears.',
        },
      },
      {
        type: 'loop',
        title: 'The 5Rs of the circular economy',
        chips: ['Rethink', 'Reduce', 'Reuse', 'Repair', 'Recycle'],
        note: 'Recycling matters, but it\'s the last R: first rethink what you buy, reduce what you consume, reuse what you already have, and repair before replacing.',
      },
      {
        type: 'cards',
        title: 'This is how you take part in the cycle',
        items: [
          { icon: CARD_ICONS.bag, title: 'Buy with intention', text: 'Choose durable, refillable products or ones with recyclable packaging. Every purchase is a vote.' },
          { icon: CARD_ICONS.wrench, title: 'Repair and share', text: 'Fix your appliances, donate clothes you no longer use, and swap instead of tossing.' },
          { icon: CARD_ICONS.loop, title: 'Close the loop', text: 'Bring your recyclables to Giving Back: by exchanging them for points, the materials return to industry as raw material.' },
        ],
      },
    ],
  },
  {
    id: 'sostenible',
    name: 'Sustainable living',
    tagline: 'Everyday habits',
    svg: ICONS.sostenible,
    intro:
      'Sustainability doesn\'t require drastic changes: it\'s small daily habits that, multiplied by thousands of Salvadorans, transform the country.',
    sections: [
      {
        type: 'cards',
        title: 'Habits that add up every day',
        items: [
          { icon: CARD_ICONS.tote, title: 'Bring your reusable bag', text: 'A cloth bag replaces hundreds of plastic bags a year at the market or supermarket.' },
          { icon: CARD_ICONS.bottle, title: 'Use a refillable bottle', text: 'Avoid disposable bottles and cut your spending: the planet and your wallet will thank you.' },
          { icon: CARD_ICONS.sprout, title: 'Compost at home', text: 'Peels and food scraps turn into fertilizer for your plants in just a few weeks.' },
          { icon: CARD_ICONS.basket, title: 'Buy local', text: 'Local markets and producers generate less packaging and less polluting transport.' },
          { icon: CARD_ICONS.drop, title: 'Save water and energy', text: 'Turn off the tap while you brush your teeth and unplug appliances you\'re not using.' },
          { icon: CARD_ICONS.gift, title: 'Donate before you toss', text: 'Clothes, toys, and furniture in good condition can have a second life with another family.' },
        ],
      },
      {
        type: 'fact',
        icon: CARD_ICONS.pin,
        text: 'Caring for the environment is everyone\'s job. MARN promotes environmental education and waste management programs across the country: learn about them, get involved, and share what you\'ve learned.',
      },
    ],
  },
]

/* ── Awareness quiz ── */
const quiz = [
  {
    q: 'Which of these materials should NOT go with the recyclables?',
    options: ['Clean PET bottle', 'Aluminum can', 'Dirty napkin', 'Folded cardboard box'],
    correct: 2,
    explain: 'Dirty or greasy paper contaminates the rest of the batch. It\'s better to compost it if it\'s purely organic, or put it in regular trash.',
  },
  {
    q: 'Before handing in a plastic container for recycling, you should…',
    options: ['Break it into little pieces', 'Rinse and dry it', 'Paint it green', 'Burn it a little'],
    correct: 1,
    explain: 'A clean, dry container keeps the material\'s quality and makes the whole recycling process easier.',
  },
  {
    q: 'What is the goal of the circular economy?',
    options: [
      'Produce faster and cheaper',
      'Keep materials in use for as long as possible',
      'Export all the trash',
      'Only use imported products',
    ],
    correct: 1,
    explain: 'The circular economy extends the life of products and materials so that almost nothing ends up as trash.',
  },
  {
    q: 'What is the correct order of the classic 3Rs?',
    options: ['Recycle, Reduce, Reuse', 'Reuse, Recycle, Reduce', 'Reduce, Reuse, Recycle', 'Reduce, Recycle, Reuse'],
    correct: 2,
    explain: 'First reduce what you consume, then reuse what you already have, and as a last resort, recycle.',
  },
  {
    q: 'Recycling aluminum saves approximately…',
    options: ['10% of the energy', '35% of the energy', '60% of the energy', '95% of the energy'],
    correct: 3,
    explain: 'Producing recycled aluminum uses about 95% less energy than making it from raw ore. That\'s why cans are worth so much!',
  },
]

const qIndex = ref(0)
const selected = ref(null)
const answered = ref(false)
const score = ref(0)
const quizDone = ref(false)

/* ── Computed ── */
const nextTopic = computed(() => {
  if (!currentTopic.value) return topics[0]
  const i = topics.findIndex(t => t.id === currentTopic.value.id)
  return topics[(i + 1) % topics.length]
})

const currentQuestion = computed(() => quiz[qIndex.value])
const progressPct = computed(() => ((qIndex.value + (answered.value ? 1 : 0)) / quiz.length) * 100)

const resultMessage = computed(() => {
  if (score.value === quiz.length)
    return { title: 'MARN Level!', icon: CARD_ICONS.trophy, text: 'You\'ve mastered recycling and the circular economy. You\'re a true guardian of El Salvador\'s environment.' }
  if (score.value >= 3)
    return { title: 'Well done!', icon: CARD_ICONS.leaf, text: 'You\'re almost there. Review the materials guide and the 5Rs to become an expert.' }
  return { title: 'Good start', icon: CARD_ICONS.sprout, text: 'Every expert started here. Explore the topics and try again: the planet will thank you.' }
})

/* ── Methods ── */
function goToTopic(topic) {
  currentTopic.value = topic
  screen.value = 'topic'
}

function startQuiz() {
  qIndex.value = 0
  selected.value = null
  answered.value = false
  score.value = 0
  quizDone.value = false
  screen.value = 'quiz'
}

function selectOption(i) {
  if (answered.value) return
  selected.value = i
  answered.value = true
  if (i === currentQuestion.value.correct) score.value++
}

function nextQuestion() {
  if (qIndex.value === quiz.length - 1) {
    quizDone.value = true
    return
  }
  qIndex.value++
  selected.value = null
  answered.value = false
}
</script>

<style scoped>
/* ══════════ "GIVING BACK" PALETTE ══════════
   Main forest green:   #0D2B0D
   Hover green:         #164216
   Accent (light green): #8FE58F
   Cream background:    #F6F8F3
   Soft borders:        #E3EAE0
*/
.app {
  --green-950: #0D2B0D;
  --green-800: #164216;
  --green-tint: #EAF3E7;
  --accent: #8FE58F;
  --bg: #b9c5ac;
  --card: #ffffff;
  --line: #E3EAE0;
  --ink: #0D2B0D;
  --muted: #5C6E5C;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  box-sizing: border-box;
}

/* Pantallas en formato 16:9 (como un monitor normal) */
.page {
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
}

/* Content centered at normal screen width */
.home-page .hdr, .home-page .hero, .home-page .cat-grid, .home-page .cat-lbl, .home-page .marn-note,
.topic-page .hdr, .topic-page .topic-hero, .topic-page .sec, .topic-page .topic-nav,
.quiz-page .hdr, .quiz-page .quiz-body, .quiz-page .quiz-result {
  max-width: 1240px; margin-left: auto; margin-right: auto;
}

/* Shared logo */
.logo { font-size: clamp(1.3rem, 1.1rem + 0.8vw, 1.9rem); font-weight: 800; line-height: 1.1; text-align: center; color: var(--ink); letter-spacing: .5px; }
.g { color: #3E7C3E; }
.logo.on-dark { color: #ffffff; }
.logo.on-dark .g { color: var(--accent); }

/* Shared header */
.hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: clamp(14px, 2vw, 24px); }
.back-btn {
  width: clamp(34px, 3vw, 44px); height: clamp(34px, 3vw, 44px); border-radius: 50%;
  border: 1.5px solid var(--line); background: var(--card);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--ink); flex-shrink: 0;
  transition: background .2s, border-color .2s, transform .2s ease;
}
.back-btn:hover { background: var(--green-tint); border-color: var(--green-950); transform: scale(1.1); }
.back-btn.dark { background: transparent; border-color: rgba(255,255,255,.45); color: #ffffff; }
.back-btn.dark:hover { background: rgba(255,255,255,.12); border-color: #ffffff; }

/* Botones compartidos */
.btn-primary {
  background: var(--green-950); color: #ffffff; border: 1.5px solid rgba(255,255,255,.5); border-radius: 50px;
  padding: clamp(12px, 1.5vh, 16px) clamp(22px, 2.2vw, 32px);
  font-size: clamp(.9rem, .85rem + 0.3vw, 1.05rem); font-weight: 700; cursor: pointer;
  transition: background .2s, transform .2s, box-shadow .2s;
}
.btn-primary:hover { background: var(--green-800); transform: translateY(-2px); box-shadow: 0 8px 18px rgba(13,43,13,.3); }
.btn-ghost {
  background: transparent; color: #ffffff; border: 1.5px solid rgba(255,255,255,.5);
  border-radius: 50px; padding: clamp(12px, 1.5vh, 16px) clamp(22px, 2.2vw, 32px);
  font-size: clamp(.9rem, .85rem + 0.3vw, 1.05rem); font-weight: 700; cursor: pointer;
  transition: background .2s, transform .2s;
}
.btn-ghost:hover { background: rgba(255,255,255,.14); transform: translateY(-2px); }
.btn-ghost.dark-ghost { color: var(--green-950); border-color: var(--green-950); }
.btn-ghost.dark-ghost:hover { background: var(--green-tint); }
.btn-redeem {
  background: var(--accent); color: var(--green-950); border: none; border-radius: 50px;
  padding: clamp(11px, 1.3vh, 14px) clamp(20px, 2vw, 30px);
  font-size: clamp(.85rem, .8rem + 0.3vw, 1rem); font-weight: 800; cursor: pointer;
  transition: filter .2s, transform .2s, box-shadow .2s;
}
.btn-redeem:hover { filter: brightness(1.06); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(143,229,143,.35); }
.btn-clear {
  background: transparent; color: #ffffff; border: 1.5px solid rgba(255,255,255,.45);
  border-radius: 50px; padding: clamp(10px, 1.2vh, 13px) clamp(20px, 2vw, 30px);
  font-size: clamp(.82rem, .78rem + 0.25vw, .95rem); font-weight: 700; cursor: pointer;
  transition: background .15s;
}
.btn-clear:hover { background: rgba(255,255,255,.12); }

/* ── HOME ── */
.home-page { background: var(--bg); padding: clamp(14px, 3vw, 40px) clamp(14px, 4vw, 56px); }
.marn-pill {
  display: flex; align-items: center; gap: 8px;
  background: var(--green-950); color: #DCEBDC;
  border-radius: 50px; padding: clamp(8px, 1vh, 11px) clamp(14px, 1.5vw, 20px);
  font-size: clamp(.75rem, .72rem + 0.25vw, .92rem);
}
.marn-pill strong { color: var(--accent); letter-spacing: .5px; }
.hero {
  background: var(--green-950); border-radius: clamp(20px, 2vw, 28px);
  padding: clamp(28px, 5vh, 64px) clamp(22px, 4vw, 72px);
  text-align: center; margin-bottom: clamp(20px, 3vh, 36px);
  position: relative; overflow: hidden;
}
.hero-decor {
  position: absolute; right: -20px; bottom: -50px;
  width: clamp(120px, 16vw, 240px); height: clamp(120px, 16vw, 240px);
  color: rgba(143,229,143,.08);
  pointer-events: none;
}
.eyebrow {
  font-size: clamp(.7rem, .68rem + 0.2vw, .85rem); font-weight: 700; letter-spacing: 2px;
  color: var(--accent); margin-bottom: clamp(10px, 1.5vh, 16px);
}
.hero-title {
  font-size: clamp(1.6rem, 1.2rem + 2vw, 3rem); font-weight: 800; color: #ffffff;
  line-height: 1.15; max-width: 800px; margin: 0 auto clamp(12px, 1.8vh, 18px);
}
.hl { color: var(--accent); }
.hero-sub {
  font-size: clamp(.88rem, .82rem + 0.35vw, 1.1rem); color: #DCEBDC; line-height: 1.6;
  max-width: 720px; margin: 0 auto clamp(18px, 2.5vh, 28px);
}
.hero-actions { display: flex; gap: clamp(10px, 1.2vw, 16px); justify-content: center; flex-wrap: wrap; }
.cat-lbl {
  font-size: clamp(.78rem, .74rem + 0.3vw, 1rem); font-weight: 700; color: var(--muted);
  letter-spacing: 1.2px; text-align: center; margin-bottom: clamp(12px, 1.5vw, 22px);
}
.cat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(14px, 1.8vw, 24px); }
@media (min-width: 500px) { .cat-grid { grid-template-columns: repeat(4, 1fr); } }
.cat-card {
  display: flex; flex-direction: column; align-items: center; gap: clamp(10px, 1.1vw, 14px);
  background: var(--card); border: 1.5px solid var(--line); border-radius: clamp(20px, 1.8vw, 26px);
  padding: clamp(22px, 2.6vw, 38px) 14px clamp(18px, 2.2vw, 30px); cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.cat-card:hover { transform: translateY(-5px); border-color: var(--green-950); box-shadow: 0 10px 28px rgba(13,43,13,.14); }
.cat-icon { width: clamp(74px, 7.5vw, 110px); height: clamp(74px, 7.5vw, 110px); display: flex; align-items: center; justify-content: center; transition: transform .3s cubic-bezier(.34,1.56,.64,1); }
.cat-card:hover .cat-icon { transform: scale(1.1) rotate(-4deg); }
.cat-icon :deep(svg), .cat-icon svg { width: 100% !important; height: 100% !important; }
.cat-name { font-size: clamp(.92rem, .84rem + 0.4vw, 1.2rem); font-weight: 700; text-align: center; line-height: 1.3; color: var(--ink); }
.cat-tag { font-size: clamp(.72rem, .7rem + 0.2vw, .85rem); color: var(--muted); text-align: center; }
.cat-arrow {
  width: clamp(30px, 2.6vw, 40px); height: clamp(30px, 2.6vw, 40px); border-radius: 50%;
  background: var(--accent); color: var(--green-950);
  display: flex; align-items: center; justify-content: center;
  font-size: clamp(1.2rem, 1.1rem + 0.3vw, 1.5rem); font-weight: 700; padding-left: 2px;
  transition: background .2s, color .2s, transform .25s ease;
}
.cat-card:hover .cat-arrow { background: var(--green-950); color: var(--accent); transform: translateX(5px); }
.marn-note {
  text-align: center; color: var(--muted);
  font-size: clamp(.72rem, .7rem + 0.2vw, .85rem);
  margin-top: clamp(16px, 2.5vh, 28px); padding-bottom: 8px;
}

/* ── TOPIC ── */
.topic-page { background: var(--bg); padding: clamp(14px, 3vw, 40px) clamp(14px, 4vw, 56px); }
.quiz-btn {
  background: var(--accent); color: var(--green-950); border: none; border-radius: 50px;
  padding: clamp(8px, 1vh, 11px) clamp(16px, 1.6vw, 22px);
  font-size: clamp(.8rem, .76rem + 0.25vw, .95rem); font-weight: 800; cursor: pointer;
  transition: filter .2s, transform .2s, box-shadow .2s;
}
.quiz-btn:hover { filter: brightness(1.06); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(143,229,143,.35); }
.topic-hero {
  display: flex; align-items: center; gap: clamp(18px, 2.5vw, 36px);
  background: var(--green-950); border-radius: clamp(18px, 1.8vw, 26px);
  padding: clamp(20px, 3vh, 40px) clamp(20px, 3vw, 48px);
  margin-bottom: clamp(20px, 3vh, 34px);
}
.topic-hero-icon {
  width: clamp(84px, 9vw, 130px); height: clamp(84px, 9vw, 130px); flex-shrink: 0;
  background: rgba(255,255,255,.94); border-radius: 22px;
  display: flex; align-items: center; justify-content: center;
  padding: clamp(10px, 1.2vw, 16px);
}
.topic-hero-icon :deep(svg), .topic-hero-icon svg { width: 100% !important; height: 100% !important; }
.topic-eyebrow { font-size: clamp(.7rem, .68rem + 0.2vw, .85rem); font-weight: 700; letter-spacing: 1.8px; color: var(--accent); text-transform: uppercase; margin-bottom: 6px; }
.topic-title { font-size: clamp(1.4rem, 1.15rem + 1.2vw, 2.4rem); font-weight: 800; color: #ffffff; margin-bottom: clamp(8px, 1.2vh, 12px); }
.topic-intro { font-size: clamp(.86rem, .8rem + 0.3vw, 1.05rem); color: #DCEBDC; line-height: 1.6; max-width: 760px; }

.sec { margin-bottom: clamp(22px, 3.2vh, 40px); }
.sec-title { font-size: clamp(1.1rem, .95rem + 0.7vw, 1.6rem); font-weight: 800; color: var(--ink); margin-bottom: clamp(12px, 1.8vh, 20px); }

/* Info cards */
.info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: clamp(12px, 1.4vw, 20px); }
.info-card {
  background: var(--card); border: 1.5px solid var(--line); border-radius: 16px;
  padding: clamp(16px, 1.8vw, 26px);
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.info-card:hover { transform: translateY(-4px); border-color: var(--green-950); box-shadow: 0 8px 22px rgba(13,43,13,.12); }
.info-emoji { font-size: clamp(1.5rem, 1.3rem + 0.8vw, 2.2rem); margin-bottom: 8px; color: var(--green-950); }
.info-emoji svg { width: 1em; height: 1em; display: block; }
.info-title { font-size: clamp(.92rem, .86rem + 0.3vw, 1.1rem); font-weight: 700; color: var(--ink); margin-bottom: 6px; }
.info-text { font-size: clamp(.8rem, .76rem + 0.25vw, .95rem); color: var(--muted); line-height: 1.55; }

/* Numbered steps */
.steps { display: flex; flex-direction: column; gap: clamp(10px, 1.2vw, 16px); }
.step-row {
  display: flex; align-items: flex-start; gap: clamp(12px, 1.4vw, 20px);
  background: var(--card); border: 1.5px solid var(--line); border-radius: 16px;
  padding: clamp(14px, 1.5vw, 22px) clamp(16px, 1.8vw, 26px);
  transition: transform .15s ease, border-color .15s, box-shadow .15s;
}
.step-row:hover { transform: translateX(5px); border-color: var(--green-950); box-shadow: 0 4px 12px rgba(13,43,13,.08); }
.step-num {
  width: clamp(34px, 3vw, 44px); height: clamp(34px, 3vw, 44px); border-radius: 50%;
  background: var(--accent); color: var(--green-950); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: clamp(.95rem, .9rem + 0.3vw, 1.15rem); font-weight: 800;
}
.step-title { font-size: clamp(.92rem, .86rem + 0.3vw, 1.1rem); font-weight: 700; color: var(--ink); margin-bottom: 3px; }
.step-text { font-size: clamp(.8rem, .76rem + 0.25vw, .95rem); color: var(--muted); line-height: 1.55; }

/* Material guide */
.mat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: clamp(12px, 1.4vw, 20px); }
.mat-card {
  background: var(--card); border: 1.5px solid var(--line); border-radius: 16px;
  padding: clamp(16px, 1.8vw, 24px); display: flex; flex-direction: column; gap: 8px;
  transition: transform .15s ease, border-color .15s, box-shadow .15s;
}
.mat-card:hover { transform: translateY(-4px); border-color: var(--green-950); box-shadow: 0 8px 22px rgba(13,43,13,.12); }
.mat-icon { width: clamp(48px, 4.5vw, 62px); height: clamp(48px, 4.5vw, 62px); }
.mat-icon :deep(svg), .mat-icon svg { width: 100% !important; height: 100% !important; }
.mat-name { font-size: clamp(.92rem, .86rem + 0.3vw, 1.1rem); font-weight: 700; color: var(--ink); }
.mat-list { border-radius: 10px; padding: 8px 12px; font-size: clamp(.76rem, .73rem + 0.2vw, .9rem); line-height: 1.5; }
.mat-list.ok { background: var(--green-tint); color: var(--green-950); }
.mat-list.bad { background: #FCEBEB; color: #A32D2D; }
.mat-lbl { font-weight: 800; display: block; margin-bottom: 2px; }

/* Linear vs circular comparison */
.compare { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(12px, 1.5vw, 22px); }
.cmp-col { border-radius: 16px; padding: clamp(16px, 2vw, 28px); }
.cmp-col.linear { background: var(--card); border: 1.5px solid var(--line); }
.cmp-col.circular { background: var(--green-950); }
.cmp-title { font-size: clamp(.95rem, .88rem + 0.35vw, 1.2rem); font-weight: 800; margin-bottom: clamp(10px, 1.4vh, 16px); }
.linear .cmp-title { color: var(--muted); }
.circular .cmp-title { color: var(--accent); }
.cmp-chain { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: clamp(10px, 1.4vh, 16px); }
.cmp-chip {
  border-radius: 20px; padding: 5px 12px;
  font-size: clamp(.74rem, .71rem + 0.2vw, .88rem); font-weight: 700;
}
.linear .cmp-chip { background: #EFEFEC; color: var(--muted); }
.circular .cmp-chip { background: var(--accent); color: var(--green-950); }
.cmp-arrow { font-weight: 700; }
.linear .cmp-arrow { color: #B9B9B2; }
.circular .cmp-arrow { color: var(--accent); }
.cmp-text { font-size: clamp(.78rem, .75rem + 0.22vw, .92rem); line-height: 1.55; }
.linear .cmp-text { color: var(--muted); }
.circular .cmp-text { color: #DCEBDC; }

/* Diagrama circular 5R */
.loop-wrap { display: flex; align-items: center; gap: clamp(20px, 3vw, 48px); flex-wrap: wrap; }
.loop {
  position: relative; flex-shrink: 0;
  width: clamp(240px, 26vw, 360px); height: clamp(240px, 26vw, 360px);
}
.loop-ring {
  position: absolute; inset: clamp(28px, 3vw, 42px);
  border: 3px dashed var(--accent); border-radius: 50%;
  animation: spin 40s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loop-chip {
  position: absolute; transform: translate(-50%, -50%);
  background: var(--green-950); color: #ffffff;
  border-radius: 20px; padding: clamp(6px, 0.8vh, 9px) clamp(12px, 1.2vw, 18px);
  font-size: clamp(.72rem, .7rem + 0.22vw, .9rem); font-weight: 700; white-space: nowrap;
  box-shadow: 0 4px 12px rgba(13,43,13,.2);
  transition: transform .2s ease, background .2s;
}
.loop-chip:hover { transform: translate(-50%, -50%) scale(1.12); background: var(--green-800); }
.lc1 { left: 50%; top: 5%; }
.lc2 { left: 93%; top: 37%; }
.lc3 { left: 76%; top: 88%; }
.lc4 { left: 24%; top: 88%; }
.lc5 { left: 7%; top: 37%; }
.loop-center {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  width: clamp(76px, 8vw, 110px); height: clamp(76px, 8vw, 110px); border-radius: 50%;
  background: var(--green-950); color: var(--accent);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  font-size: clamp(.95rem, .9rem + 0.3vw, 1.15rem); font-weight: 800;
}
.loop-note {
  flex: 1; min-width: 240px;
  background: var(--green-tint); border-radius: 16px;
  padding: clamp(16px, 2vw, 26px);
  font-size: clamp(.84rem, .8rem + 0.28vw, 1rem); color: var(--green-950); line-height: 1.6;
}

/* Highlighted fact */
.fact-band {
  display: flex; align-items: center; gap: clamp(14px, 1.8vw, 24px);
  background: var(--green-950); border-radius: 16px;
  padding: clamp(16px, 2vw, 28px) clamp(18px, 2.2vw, 32px);
}
.fact-emoji { font-size: clamp(1.6rem, 1.4rem + 0.9vw, 2.4rem); flex-shrink: 0; color: var(--accent); }
.fact-emoji svg { width: 1em; height: 1em; display: block; }
.fact-text { font-size: clamp(.86rem, .8rem + 0.3vw, 1.05rem); color: #DCEBDC; line-height: 1.6; }

.topic-nav {
  display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  padding-bottom: clamp(10px, 1.5vh, 20px);
}

/* ── QUIZ ── */
.quiz-page { background: var(--green-950); padding: clamp(14px, 3vw, 40px) clamp(14px, 4vw, 56px); }
.score-pill {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.1); border-radius: 50px;
  padding: clamp(7px, 0.9vh, 10px) clamp(14px, 1.4vw, 20px);
  color: var(--accent); font-weight: 800; font-size: clamp(.95rem, .9rem + 0.3vw, 1.15rem);
}
.quiz-body { max-width: 860px !important; }
.q-progress {
  height: 8px; background: rgba(255,255,255,.15); border-radius: 10px;
  overflow: hidden; margin-bottom: clamp(10px, 1.4vh, 16px);
}
.q-progress-fill { height: 100%; background: var(--accent); border-radius: 10px; transition: width .4s ease; }
.q-count { font-size: clamp(.76rem, .73rem + 0.22vw, .9rem); color: #BFE3BF; font-weight: 700; letter-spacing: 1px; margin-bottom: clamp(8px, 1.2vh, 14px); }
.q-text {
  font-size: clamp(1.15rem, 1rem + 0.8vw, 1.8rem); font-weight: 800; color: #ffffff;
  line-height: 1.3; margin-bottom: clamp(16px, 2.4vh, 28px);
}
.q-options { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(10px, 1.2vw, 16px); margin-bottom: clamp(14px, 2vh, 22px); }
.q-opt {
  display: flex; align-items: center; gap: clamp(10px, 1.2vw, 16px); text-align: left;
  background: rgba(255,255,255,.06); border: 1.5px solid rgba(255,255,255,.28); border-radius: 16px;
  padding: clamp(12px, 1.5vh, 18px) clamp(14px, 1.5vw, 22px);
  color: #ffffff; font-size: clamp(.84rem, .8rem + 0.28vw, 1rem); font-weight: 600;
  cursor: pointer; transition: background .15s, border-color .15s, transform .15s ease, opacity .2s;
}
.q-opt:hover:not(:disabled) { background: rgba(255,255,255,.14); border-color: var(--accent); transform: translateY(-2px); }
.q-opt:disabled { cursor: default; }
.q-opt.correct { background: rgba(143,229,143,.22); border-color: var(--accent); color: #ffffff; }
.q-opt.correct .q-letter { background: var(--accent); color: var(--green-950); }
.q-opt.wrong { background: rgba(163,45,45,.28); border-color: #E08585; }
.q-opt.wrong .q-letter { background: #E08585; color: #4A0E0E; }
.q-opt.dim { opacity: .45; }
.q-letter {
  width: clamp(28px, 2.6vw, 36px); height: clamp(28px, 2.6vw, 36px); border-radius: 50%; flex-shrink: 0;
  background: rgba(255,255,255,.14); color: #ffffff;
  display: flex; align-items: center; justify-content: center;
  font-size: clamp(.78rem, .75rem + 0.22vw, .92rem); font-weight: 800;
  transition: background .15s, color .15s;
}
.q-feedback {
  border-radius: 16px; padding: clamp(14px, 1.8vh, 22px) clamp(16px, 1.8vw, 26px);
  display: flex; flex-direction: column; gap: 8px; align-items: flex-start;
}
.q-feedback.good { background: rgba(143,229,143,.16); border: 1.5px solid rgba(143,229,143,.5); }
.q-feedback.oops { background: rgba(255,255,255,.07); border: 1.5px solid rgba(255,255,255,.3); }
.q-feedback strong { color: var(--accent); font-size: clamp(.95rem, .9rem + 0.3vw, 1.15rem); }
.q-feedback.oops strong { color: #F0C9C9; }
.q-feedback p { color: #DCEBDC; font-size: clamp(.82rem, .78rem + 0.25vw, .98rem); line-height: 1.55; }
.fade-enter-active { transition: opacity .3s ease, transform .3s ease; }
.fade-enter-from { opacity: 0; transform: translateY(8px); }

/* Resultado */
.quiz-result {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding-top: clamp(10px, 4vh, 40px);
}
.result-circle {
  width: clamp(110px, 12vw, 160px); height: clamp(110px, 12vw, 160px); border-radius: 50%;
  border: 4px solid var(--accent); background: rgba(143,229,143,.1);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: clamp(14px, 2vh, 24px);
  animation: pop .45s cubic-bezier(.34,1.56,.64,1);
}
@keyframes pop { from { transform: scale(.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.result-score { font-size: clamp(1.6rem, 1.3rem + 1.4vw, 2.8rem); font-weight: 800; color: var(--accent); }
.result-icon {
  width: clamp(30px, 3vw, 40px); height: clamp(30px, 3vw, 40px);
  color: var(--accent); margin-bottom: clamp(6px, 1vh, 10px);
  animation: pop .5s .1s cubic-bezier(.34,1.56,.64,1) backwards;
}
.result-icon svg { width: 100%; height: 100%; display: block; }
.result-title { font-size: clamp(1.3rem, 1.1rem + 1vw, 2.2rem); font-weight: 800; color: #ffffff; margin-bottom: clamp(8px, 1.2vh, 14px); }
.result-text { font-size: clamp(.88rem, .82rem + 0.3vw, 1.08rem); color: #DCEBDC; line-height: 1.6; max-width: 560px; margin-bottom: clamp(18px, 2.6vh, 30px); }
.result-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

/* ── ACCESIBILIDAD ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}

/* ── RESPONSIVE ── */
@media (max-width: 700px) {
  .page { aspect-ratio: auto; max-height: none; min-height: 100vh; overflow-y: visible; }
  .cat-grid { grid-template-columns: 1fr 1fr; }
  .topic-hero { flex-direction: column; text-align: center; }
  .compare { grid-template-columns: 1fr; }
  .q-options { grid-template-columns: 1fr; }
  .loop-wrap { justify-content: center; }
  .home-hdr { flex-direction: column; gap: 10px; }
  .topic-nav { flex-direction: column; }
}
</style>