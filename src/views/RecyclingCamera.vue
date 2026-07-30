<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TheNavbar           from '../components/TheNavbar.vue'
import { getInsforgeClient, useAuthStore } from '../stores/auth.js'

const TFJS_URL = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js'
const TM_IMAGE_URL = 'https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js'
const MODEL_BASE_URL = '../../tm-my-image-model/'
const CONFIDENCE_THRESHOLD = 0.92
const AMBIGUITY_MARGIN = 0.12

const materialProfiles = {
  'Plastic bottle': { points: 1, category: 'Plastic', label: 'Plastic Bottle' },
  Paper: { points: 1, category: 'Paper', label: 'Paper' },
  Cardboard: { points: 2, category: 'Cardboard', label: 'Cardboard' },
  Cans: { points: 4, category: 'Glass', label: 'Glass' },
}

const supportedMaterialsText = Object.values(materialProfiles)
  .map((profile) => profile.category)
  .filter((category, index, categories) => categories.indexOf(category) === index)
  .join(', ')

const scriptPromises = new Map()
const auth = useAuthStore()
const router = useRouter()

const videoRef = ref(null)
const canvasRef = ref(null)
const totalPoints = ref(0)
const capturedPhoto = ref('')
const objectLabel = ref('-')
const categoryLabel = ref('-')
const confidenceLabel = ref('-')
const earnedPointsLabel = ref(0)
const statusLabel = ref('Waiting...')
const statusTone = ref('idle')
const isModelReady = ref(false)
const isCameraReady = ref(false)
const isCapturing = ref(false)
const topPredictions = ref([])
const showSuccessNotice = ref(false)
const successNoticeMessage = ref('')

let model = null
let mediaStream = null

async function loadTotalPoints() {
  if (!auth.isLoggedIn) {
    totalPoints.value = Number(localStorage.getItem('givingPoints')) || 0
    return
  }

  try {
    const client = getInsforgeClient()
    const { data, error } = await client.database
      .from('user_points_wallet')
      .select('total_points')
      .maybeSingle()

    if (error) throw error
    totalPoints.value = Number(data?.total_points || 0)
  } catch (error) {
    console.error(error)
    totalPoints.value = Number(localStorage.getItem('givingPoints')) || 0
  }
}

async function persistRecyclingDetection(modelClass, confidence) {
  if (!auth.isLoggedIn) return null

  const client = getInsforgeClient()
  const { data, error } = await client.database.rpc('log_recycling_detection', {
    p_model_class: modelClass,
    p_confidence: confidence,
    p_quantity: 1,
    p_captured_image_url: capturedPhoto.value || null,
  })

  if (error) throw error
  if (Array.isArray(data)) return data[0] || null
  return data || null
}

async function refreshWalletFromServer() {
  if (!auth.isLoggedIn) return

  try {
    const client = getInsforgeClient()
    const { data, error } = await client.database
      .from('user_points_wallet')
      .select('total_points')
      .maybeSingle()

    if (error) throw error

    const serverPoints = Number(data?.total_points || 0)
    const previousPoints = Number(localStorage.getItem('givingPoints')) || totalPoints.value || 0
    totalPoints.value = Number.isFinite(serverPoints) && serverPoints >= previousPoints
      ? serverPoints
      : Math.max(previousPoints, serverPoints)

    localStorage.setItem('givingPoints', String(totalPoints.value))
  } catch (error) {
    console.error(error)
  }
}

function saveLocalRecyclingActivity(materialCategory, pointsEarned, modelClass) {
  const history = JSON.parse(localStorage.getItem('giving_recycling_history') || '[]')
  history.unshift({
    material_category: materialCategory,
    quantity: 1,
    points_earned: Number(pointsEarned || 0),
    recycled_at: new Date().toISOString(),
    model_class: modelClass,
  })

  localStorage.setItem('giving_recycling_history', JSON.stringify(history.slice(0, 50)))
}

const ICONS = {
  camera: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/></svg>',
  loop: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 4.875 9.5 8.293 5.404"/><path d="m7.9 9.5 4.5.001"/><path d="M16 9.5h.001"/><path d="m19.128 13.596-3.418 4.096"/></svg>',
  box: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8.5 12 4 3 8.5"/><path d="M3 8.5v8L12 21l9-4.5v-8"/><path d="M3 8.5 12 13l9-4.5"/><path d="M12 13v8"/></svg>',
  target: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
}

const captureButtonText = computed(() => (isCapturing.value ? 'Processing...' : 'Take Photo'))

function loadExternalScript(src) {
  if (scriptPromises.has(src)) {
    return scriptPromises.get(src)
  }

  const promise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`)

    if (existingScript?.dataset.loaded === 'true') {
      resolve()
      return
    }

    const script = existingScript || document.createElement('script')

    script.src = src
    script.async = true

    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })

    script.addEventListener('error', () => {
      scriptPromises.delete(src)
      reject(new Error(`Could not load script: ${src}`))
    }, { once: true })

    if (!existingScript) {
      document.head.appendChild(script)
    }
  })

  scriptPromises.set(src, promise)
  return promise
}

function syncReadyStatus() {
  if (isModelReady.value && isCameraReady.value) {
    statusLabel.value = 'Ready to capture.'
    statusTone.value = 'success'
  }
}

async function loadModel() {
  statusLabel.value = 'Loading model...'
  statusTone.value = 'idle'

  try {
    await loadExternalScript(TFJS_URL)
    await loadExternalScript(TM_IMAGE_URL)

    model = await window.tmImage.load(
      `${MODEL_BASE_URL}model.json`,
      `${MODEL_BASE_URL}metadata.json`,
    )

    isModelReady.value = true
    statusLabel.value = `Model ready. Supported materials: ${supportedMaterialsText}.`
    statusTone.value = 'success'
    syncReadyStatus()
  } catch (error) {
    console.error(error)
    statusLabel.value = 'Could not load the model. Copy your model to public/tm-my-image-model/.'
    statusTone.value = 'error'
  }
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    statusLabel.value = 'This browser does not support camera access.'
    statusTone.value = 'error'
    return
  }

  statusLabel.value = 'Opening camera...'
  statusTone.value = 'idle'

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })
  } catch {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })
  }

  if (!videoRef.value) {
    return
  }

  try {
    videoRef.value.srcObject = mediaStream
    await videoRef.value.play()
    isCameraReady.value = true
    syncReadyStatus()
  } catch (error) {
    console.error(error)
    statusLabel.value = 'Could not start the camera.'
    statusTone.value = 'error'
  }
}

async function capturePhoto() {
  if (isCapturing.value) {
    return
  }

  if (!model) {
    statusLabel.value = 'The model is not ready yet.'
    statusTone.value = 'error'
    return
  }

  if (!videoRef.value || !canvasRef.value || !videoRef.value.videoWidth) {
    statusLabel.value = 'The camera is not ready yet.'
    statusTone.value = 'error'
    return
  }

  isCapturing.value = true

  try {
    const canvas = canvasRef.value
    const context = canvas.getContext('2d')

    canvas.width = videoRef.value.videoWidth
    canvas.height = videoRef.value.videoHeight
    context.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)

    capturedPhoto.value = canvas.toDataURL('image/png')

    const predictions = await model.predict(canvas)
    const sortedPredictions = [...predictions].sort((left, right) => {
      return right.probability - left.probability
    })
    const bestPrediction = sortedPredictions.reduce((best, current) => {
      return current.probability > best.probability ? current : best
    })
    const secondPrediction = sortedPredictions[1]

    const detectedObject = bestPrediction.className
    const probability = bestPrediction.probability
    const probabilityGap = secondPrediction ? probability - secondPrediction.probability : probability

    topPredictions.value = sortedPredictions.slice(0, 3).map((prediction) => ({
      className: prediction.className,
      probability: `${(prediction.probability * 100).toFixed(1)}%`,
    }))
objectLabel.value = detectedObject
confidenceLabel.value = `${(probability * 100).toFixed(2)}%`
earnedPointsLabel.value = 0

if (probability < CONFIDENCE_THRESHOLD) {
  categoryLabel.value = 'Unknown'
  statusLabel.value = 'Confidence is too low. Try moving the object closer and improving the lighting.'
  statusTone.value = 'warning'
  return
}

if (secondPrediction && probabilityGap < AMBIGUITY_MARGIN) {
  categoryLabel.value = 'Ambiguous'
  statusLabel.value = `Ambiguous classification between ${bestPrediction.className} and ${secondPrediction.className}.`
  statusTone.value = 'warning'
  return
}

if (materialProfiles[detectedObject]) {
  const data = materialProfiles[detectedObject]

  objectLabel.value = data.label
  categoryLabel.value = data.category
  earnedPointsLabel.value = data.points
  statusLabel.value = `Material detected: ${data.category}`
  statusTone.value = 'success'

  let rewardMessage = ` ${data.points} Point have been added to your profile for detecting ${data.category}!`

  try {
    const persisted = await persistRecyclingDetection(detectedObject, probability)
    const previousPoints = Number(localStorage.getItem('givingPoints')) || totalPoints.value || 0
    const persistedPoints = Number(persisted?.total_points)

    if (Number.isFinite(persistedPoints) && persistedPoints >= previousPoints) {
      totalPoints.value = persistedPoints
    } else {
      totalPoints.value = previousPoints + data.points
    }

    saveLocalRecyclingActivity(data.category, data.points, detectedObject)
    await refreshWalletFromServer()
  } catch (error) {
    console.error(error)
    const previousPoints = Number(localStorage.getItem('givingPoints')) || totalPoints.value || 0
    totalPoints.value = previousPoints + data.points
    saveLocalRecyclingActivity(data.category, data.points, detectedObject)
    localStorage.setItem('givingPoints', String(totalPoints.value))
    rewardMessage = ` ${data.points} Point have been added locally. They will be synced with your profile soon.`
    statusLabel.value = `Material detected: ${data.category}. Pending sync with server.`
    statusTone.value = 'warning'
  }

  localStorage.setItem('givingPoints', String(totalPoints.value))
  successNoticeMessage.value = rewardMessage
  showSuccessNotice.value = true

  if (auth.isLoggedIn) {
    router.push({ path: '/Account', query: { reward: rewardMessage } })
  }
  return
}

categoryLabel.value = 'Unknown'
statusLabel.value = 'This class is not trained in the model.'
statusTone.value = 'warning'
} catch (error) {
  console.error(error)
  statusLabel.value = 'Could not analyze the image.'
  statusTone.value = 'error'
} finally {
  isCapturing.value = false
}
}

function resetPoints() {
  const confirmed = window.confirm('Are you sure you want to reset your Giving Points?')

  if (!confirmed) {
    return
  }

  totalPoints.value = 0
  objectLabel.value = '-'
  categoryLabel.value = '-'
  confidenceLabel.value = '-'
  earnedPointsLabel.value = 0
  topPredictions.value = []
  statusLabel.value = isModelReady.value && isCameraReady.value
    ? 'Ready to capture.'
    : 'Waiting...'
  statusTone.value = isModelReady.value && isCameraReady.value ? 'success' : 'idle'

  localStorage.setItem('givingPoints', '0')
}

function stopCamera() {
  if (!mediaStream) {
    return
  }

  mediaStream.getTracks().forEach((track) => track.stop())
  mediaStream = null
}

onMounted(async () => {
  await Promise.allSettled([loadModel(), startCamera(), loadTotalPoints()])
})

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<template>
  <TheNavbar />
  <section class="camera-page">
    <header class="camera-header">
      <p class="eyebrow">Giving Back</p>
      <h1>Camera Recycling</h1>
      <p class="subtitle">
        Capture a recyclable item, classify it by material, and prioritize accuracy using a high-confidence filter.
      </p>
    </header>

    <div v-if="showSuccessNotice" class="success-banner" role="status" aria-live="polite">
      <strong>¡Puntos agregados!</strong>
      <span>{{ successNoticeMessage }}</span>
    </div>

    <div class="camera-layout">
      <div class="camera-stage">
        <video ref="videoRef" autoplay playsinline muted></video>

        <button class="primary-button" type="button" :disabled="isCapturing" @click="capturePhoto">
          <span class="btn-icon" v-if="!isCapturing" v-html="ICONS.camera"></span>
          {{ captureButtonText }}
        </button>

        <canvas ref="canvasRef"></canvas>

        <div class="photo-frame">
          <img v-if="capturedPhoto" :src="capturedPhoto" alt="Captured photo" />
          <p v-else>The captured photo will appear here.</p>
        </div>
      </div>

      <aside class="result-card">
        <h2>Result</h2>

        <div class="result-row">
          <span class="row-label"><span class="row-icon" v-html="ICONS.loop"></span>Object</span>
          <strong>{{ objectLabel }}</strong>
        </div>

        <div class="result-row">
          <span class="row-label"><span class="row-icon" v-html="ICONS.box"></span>Category</span>
          <strong>{{ categoryLabel }}</strong>
        </div>

        <div class="result-row">
          <span class="row-label"><span class="row-icon" v-html="ICONS.target"></span>Confidence</span>
          <strong>{{ confidenceLabel }}</strong>
        </div>

        <div v-if="topPredictions.length" class="prediction-list">
          <h3>Top Predictions</h3>

          <div v-for="prediction in topPredictions" :key="prediction.className" class="prediction-item">
            <span>{{ prediction.className }}</span>
            <strong>{{ prediction.probability }}</strong>
          </div>
        </div>

        <div class="score-chip">
          <img src="/assets/img/givingPoint.png" alt="Giving Point" class="gp-icon-inline" />
          Giving Points: +{{ earnedPointsLabel }}
        </div>
        <div class="total-score">
          <img src="/assets/img/givingPoint.png" alt="Giving Point" class="gp-icon-inline" />
          Total Points: {{ totalPoints }}
        </div>

        <p class="status" :data-tone="statusTone">{{ statusLabel }}</p>

        <button class="secondary-button" type="button" @click="resetPoints">
          <span class="btn-icon" v-html="ICONS.trash"></span>Reset Points
        </button>

        <p class="helper-text">
          This model supports: {{ supportedMaterialsText }}. To accurately detect metal,
          retrain the model by adding the Metal class.
        </p>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.camera-page {
  min-height: 100vh;
  padding: 32px 20px 48px;
}

.camera-header {
  max-width: 760px;
  margin: 0 auto 28px;
  text-align: center;
}

.eyebrow {
  margin: 0 0 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #b7f4c7;
  font-size: 0.82rem;
}

h1 {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 4.5rem);
  line-height: 0.95;
  color: #f4fff6;
}

.subtitle {
  margin: 16px auto 0;
  max-width: 600px;
  color: #d4e8d8;
}

.success-banner {
  width: min(1120px, 100%);
  margin: 0 auto 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(96, 214, 133, 0.22), rgba(30, 94, 53, 0.32));
  color: #f4fff6;
  border: 1px solid rgba(143, 239, 170, 0.28);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}

.success-banner strong {
  font-size: 1rem;
}

.camera-layout {
  width: min(1120px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(320px, 0.9fr);
  gap: 24px;
}

.camera-stage,
.result-card {
  border: 1px solid rgba(183, 244, 199, 0.16);
  border-radius: 28px;
  background: rgba(9, 31, 18, 0.78);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22);
}

.camera-stage {
  padding: 24px;
}

video,
.photo-frame {
  width: 100%;
  border-radius: 22px;
}

video {
  display: block;
  min-height: 320px;
  object-fit: cover;
  background: linear-gradient(135deg, rgba(34, 82, 49, 0.85), rgba(7, 22, 13, 0.95));
  border: 2px solid rgba(124, 252, 124, 0.45);
}

.primary-button,
.secondary-button {
  width: 100%;
  margin-top: 18px;
  border: none;
  border-radius: 999px;
  padding: 14px 20px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.btn-icon { display: inline-flex; align-items: center; justify-content: center; }

.primary-button {
  background: linear-gradient(135deg, #7cfc7c, #32c16c);
  color: #0c2a17;
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.primary-button:active:not(:disabled),
.secondary-button:active {
  transform: translateY(0) scale(0.98);
  box-shadow: none;
}

.primary-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.photo-frame {
  margin-top: 18px;
  min-height: 220px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 2px dashed rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.04);
  color: #d4e8d8;
}

.photo-frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-card {
  padding: 28px;
  color: #f4fff6;
}

.result-card h2 {
  margin: 0 0 20px;
  font-size: 1.6rem;
}

.result-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
}

.result-row span {
  color: #c4ddca;
}

.row-label { display: inline-flex; align-items: center; gap: 8px; }
.row-icon { display: inline-flex; color: #8fe5a0; flex-shrink: 0; }

.score-chip,
.total-score {
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.gp-icon-inline {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

.score-chip {
  background: rgba(124, 252, 124, 0.12);
  color: #7cfc7c;
}

.total-score {
  background: rgba(70, 140, 255, 0.14);
  color: #8ec5ff;
}

.status {
  margin: 18px 0 0;
  padding: 14px 16px;
  border-radius: 16px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  gap: 10px;
}

.status::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.status[data-tone='success'] {
  color: #9df2ad;
}

.status[data-tone='warning'] {
  color: #ffd27d;
}

.status[data-tone='error'] {
  color: #ff9e9e;
}

.prediction-list {
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
}

.prediction-list h3 {
  margin: 0 0 12px;
  font-size: 0.95rem;
  color: #c4ddca;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.prediction-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
}

.prediction-item + .prediction-item {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.secondary-button {
  background: #cf3d3d;
  color: #fff;
}

.helper-text {
  margin: 16px 0 0;
  color: #b5cab9;
  font-size: 0.95rem;
}

.helper-text code {
  color: #f4fff6;
}

canvas {
  display: none;
}

@media (max-width: 900px) {
  .camera-layout {
    grid-template-columns: 1fr;
  }

  .camera-page {
    padding-inline: 14px;
  }

  .camera-stage,
  .result-card {
    padding: 20px;
  }
}
</style>