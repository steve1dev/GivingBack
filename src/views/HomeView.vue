<template>
  <TheNavbar />

  <HomeCarousel :slides="slides" />

  <!-- Our Values -->
  <section class="work-section">
    <div class="work-container">
      <div class="work-text">
        <h2 class="work-title" v-reveal>Our Values</h2>
      </div>
      <dl class="stats-grid">
        <div v-reveal="0"><dt>We work with</dt><dd>Excellence</dd></div>
        <div v-reveal="80"><dt>Our environment is</dt><dd>Hardworking</dd></div>
        <div v-reveal="160"><dt>Our team is always</dt><dd>Friendly</dd></div>
        <div v-reveal="240"><dt>We need to change the</dt><dd>World</dd></div>
      </dl>
    </div>
  </section>

  <!-- Meet our team -->
  <section class="leadership-section" id="team">
    <div class="leadership-container">
      <div class="leadership-text" v-reveal>
        <h2 class="leadership-title">Meet our team</h2>
        <p class="leadership-description">
          We are a passionate, creative, and committed team, working together to turn great ideas into incredible results.
        </p>
      </div>
      <ul class="leadership-grid">
        <li v-for="(member, i) in team" :key="member.name" class="leader-card" v-reveal="(i % 4) * 70">
          <div class="leader-info">
            <img :src="member.img" :alt="member.name" class="leader-image" />
            <div>
              <h3 class="leader-name">{{ member.name }}</h3>
              <p class="leader-role">{{ member.role }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>

  <!-- How does Giving Back work? (Accordion) -->
  <AccordionHowItWorks />
  <br>
  <!-- Collaborators -->
  <CollaboratorsSection />

  <!-- Chat flotante y arrastrable -->
  <GivingChat />

</template>

<script setup>
import TheNavbar           from '../components/TheNavbar.vue'
import HomeCarousel         from '../components/HomeCarousel.vue'
import AccordionHowItWorks  from '../components/AccordionHowItWorks.vue'
import CollaboratorsSection from '../components/CollaboratorsSection.vue'
import GivingChat            from '../components/GivingChat.vue'


const slides = [
  { img: '/assets/img/recycling-hero.jpg',  title: 'Transforming communities', desc: 'We work for a greener and more sustainable future' },
  { img: '/assets/img/bottles-hero.jpg',    title: 'Constant innovation',       desc: 'We eliminate contaminants before they contaminate.' },
  { img: '/assets/img/womanRecycling.png', title: 'Together we are stronger',  desc: 'Collaborating with the best allies' },
]

const team = [
  { name: 'María Mancía',   role: 'Co-Founder / CEO',    img: '/assets/img/majo.png'     },
  { name: 'Sara Mendoza',   role: 'Co-Founder / CEO',    img: '/assets/img/sara.jpeg'    },
  { name: 'Thais Avila',    role: 'Co-Founder / CEO',    img: '/assets/img/thais.jpeg'   },
  { name: 'Steve Ramos',    role: 'Fullstack Developer', img: '/assets/img/steve.jpeg'   },
  { name: 'Danilo Aguilar', role: 'Frontend Developer',  img: '/assets/img/danilo.jpeg'  },
  { name: 'Heymi Zamora',   role: 'Community Manager',   img: '/assets/img/heymi.jpeg'   },
  { name: 'Dulce Ulloa',    role: 'Director of Design', img: '/assets/img/dulce.jpeg'   },
  { name: 'Diego Zarceño',  role: 'Mechanical Engineer', img: '/assets/img/diego 2.jpeg' },
]
</script>
