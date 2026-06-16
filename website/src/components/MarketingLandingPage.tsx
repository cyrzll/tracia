import * as React from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  ArrowRight, 
  Target, 
  Zap, 
  Users, 
  Shield, 
  Smartphone, 
  Globe,
  Mail,
  Phone,
  MessageCircle,
  LayoutDashboard,
  BrainCircuit,
  BellRing
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import Orb from "./background/orb";
import Galaxy from "./background/galaxy";
import GlassSurface from "./navbar/navbar";
import BorderGlow from "./cardGlow";
import SpotlightCard from "./cardSpotlight";
import ScrollStack, { ScrollStackItem } from "./scrollStack";
import Stack from "./imageStack";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const charVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.05 }
  },
};

const titleContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.012,
    },
  },
};

const descContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.5,
      staggerChildren: 0.005,
    },
  },
};

const titlePart1 = "Preventing ";
const titleHighlight = "Dropouts";
const titlePart2 = ",\nCreating Achievers.";
const fullDesc = "Identify at-risk students instantly with AI. Seamlessly integrate with your existing LMS to deliver proactive interventions and ensure every student succeeds.";

const universities = [
  {
    id: 1,
    name: "Universitas Indonesia",
    country: "Indonesia",
    flag: "id",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=500&auto=format"
  },
  {
    id: 2,
    name: "Universiti Malaya",
    country: "Malaysia",
    flag: "my",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=500&auto=format"
  },
  {
    id: 3,
    name: "National University of Singapore",
    country: "Singapore",
    flag: "sg",
    image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=500&auto=format"
  },
  {
    id: 4,
    name: "Chulalongkorn University",
    country: "Thailand",
    flag: "th",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=500&auto=format"
  },
  {
    id: 5,
    name: "University of the Philippines",
    country: "Philippines",
    flag: "ph",
    image: "https://images.unsplash.com/photo-1627556704353-016ed4137255?q=80&w=500&auto=format"
  }
];

export default function MarketingLandingPage() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [startTransition, setStartTransition] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>("");
  const [activeUniId, setActiveUniId] = React.useState<number>(1);

  const activeUni = universities.find(u => u.id === activeUniId) || universities[0];

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // Force dark background to prevent any light theme fallbacks during scroll lag
      document.documentElement.style.backgroundColor = "#050505";
      document.body.style.backgroundColor = "#050505";

      // Set initial loading classes if not loaded yet
      if (!(window as any).isLoaderFinished) {
        document.documentElement.classList.add('loading');
        document.body.classList.add('loading');
        if ((window as any).lenis) {
          (window as any).lenis.stop();
        }
      }

      // Check if loader is already finished or exiting (e.g. on hot-reload or page navigate)
      if ((window as any).isLoaderFinished) {
        setIsLoaded(true);
        document.documentElement.classList.remove('loading');
        document.documentElement.classList.add('loaded');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        if ((window as any).lenis) {
          (window as any).lenis.start();
        }
      }
      if ((window as any).isLoaderStartExit) {
        setStartTransition(true);
      }

      const handleLoaderFinished = () => {
        setIsLoaded(true);
        
        // Remove loading class, add loaded class
        document.documentElement.classList.remove('loading');
        document.documentElement.classList.add('loaded');
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        
        // Start Lenis scroll
        if ((window as any).lenis) {
          (window as any).lenis.start();
        }
        
        setTimeout(() => {
          const aboutUs = document.getElementById("about-us");
          if (aboutUs) {
            if ((window as any).lenis) {
              (window as any).lenis.scrollTo(aboutUs);
            } else {
              aboutUs.scrollIntoView({ behavior: "smooth" });
            }
          }
        }, 100);
      };
      window.addEventListener("loaderFinished", handleLoaderFinished);

      const handleStartExit = () => {
        setStartTransition(true);
      };
      window.addEventListener("loaderStartExit", handleStartExit);

      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
        if (window.scrollY < 200) {
          setActiveSection("");
        }
      };
      window.addEventListener("scroll", handleScroll, { passive: true });

      // Setup Scroll Spy with IntersectionObserver
      const sectionIds = ['about-us', 'features', 'pricing', 'contact'];
      const observerOptions = {
        root: null,
        rootMargin: '-120px 0px -70% 0px',
        threshold: 0,
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      }, observerOptions);

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });

      return () => {
        window.removeEventListener("loaderFinished", handleLoaderFinished);
        window.removeEventListener("loaderStartExit", handleStartExit);
        window.removeEventListener("scroll", handleScroll);
        observer.disconnect();
      };
    }
  }, []);

  return (
    <motion.div
      initial={{ y: "100vh", position: "fixed", top: 0, left: 0, height: "100vh", width: "100%" }}
      animate={{
        y: isLoaded ? 0 : (startTransition ? 0 : "100vh"),
        position: isLoaded ? "relative" : "fixed",
        height: isLoaded ? "auto" : "100vh",
        left: isLoaded ? "auto" : 0
      }}
      transition={{
        y: isLoaded 
          ? { duration: 0 } 
          : { duration: 1.2, ease: [0.76, 0, 0.24, 1] },
        position: { duration: 0 },
        height: { duration: 0 },
        left: { duration: 0 }
      }}
      className="bg-[#050505] text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen w-full"
    >
      {/* Fixed Galaxy Background (Visible only when scrolled past Hero) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <Galaxy 
          mouseRepulsion
          mouseInteraction
          density={1}
          glowIntensity={0.3}
          saturation={0}
          hueShift={140}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={1}
        />
      </div>

      {/* Navbar - Starts hidden/offset, animates down */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={isLoaded ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
        transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
        className={`fixed left-0 w-full z-50 transition-all duration-500 ease-in-out ${
          isScrolled ? "top-4 px-4 md:px-8" : "top-0 px-0"
        }`}
      >
        <div className={`mx-auto transition-all duration-500 ease-in-out ${isScrolled ? "max-w-7xl" : "max-w-full"}`}>
          <GlassSurface
            width="100%"
            height={60}
            borderRadius={isScrolled ? 24 : 0}
            className={`transition-all duration-500 ${isScrolled ? "shadow-2xl shadow-indigo-500/10" : ""}`}
            brightness={isScrolled ? 60 : 45}
            opacity={0.8}
            backgroundOpacity={isScrolled ? 0.03 : 0}
            blur={isScrolled ? 11 : 14}
            borderWidth={isScrolled ? 0.07 : 0}
            displace={isScrolled ? 15 : 0}
            distortionScale={isScrolled ? -150 : -120}
            redOffset={isScrolled ? 5 : 0}
            greenOffset={isScrolled ? 15 : 10}
            blueOffset={isScrolled ? 25 : 20}
            mixBlendMode={isScrolled ? "screen" : "difference"}
            style={{ 
              transition: 'all 0.5s ease-in-out',
              ...(!isScrolled && {
                background: 'transparent',
                boxShadow: 'none',
                backdropFilter: 'none',
              })
            }}
          >
          <div className="w-full flex items-center relative px-2 md:px-6">
            <div className="flex-1 flex items-center gap-3">
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if ((window as any).lenis) {
                    (window as any).lenis.scrollTo(0);
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="w-9 h-9 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
              >
                <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain" />
              </a>
            </div>
            
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {['About Us', 'Features', 'Pricing', 'Contact'].map((item) => {
                const targetId = item.toLowerCase().replace(' ', '-');
                const isActive = activeSection === targetId;
                return (
                  <a 
                    key={item} 
                    href={`#${targetId}`} 
                    className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors duration-300 relative ${
                      isActive ? "text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-white/10 border border-white/10 shadow-sm rounded-full z-0"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item}</span>
                  </a>
                );
              })}
            </div>

            <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
              <Button variant="ghost" className="text-zinc-400 hover:text-white text-xs md:text-sm" asChild>
                <a href="/login">Log In</a>
              </Button>
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200 rounded-full px-4 md:px-6 shadow-xl shadow-white/10 text-xs md:text-sm" asChild>
                <a href="/login">Try</a>
              </Button>
            </div>
          </div>
        </GlassSurface>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center pt-20 overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 z-0">
          <Orb
            hoverIntensity={1.5}
            rotateOnHover
            hue={260}
            backgroundColor="#050505"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <motion.h1
              variants={titleContainerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
            >
              {titlePart1.split("").map((char, i) => (
                <motion.span key={`p1-${i}`} variants={charVariants}>
                  {char}
                </motion.span>
              ))}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {titleHighlight.split("").map((char, i) => (
                  <motion.span key={`h-${i}`} variants={charVariants}>
                    {char}
                  </motion.span>
                ))}
              </span>
              {titlePart2.split("").map((char, i) => (
                <motion.span key={`p2-${i}`} variants={charVariants}>
                  {char === "\n" ? <br /> : char}
                </motion.span>
              ))}
            </motion.h1>
            
            <motion.p
              variants={descContainerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed"
            >
              {fullDesc.split("").map((char, i) => (
                <motion.span key={`d-${i}`} variants={charVariants}>
                  {char}
                </motion.span>
              ))}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 py-6 text-lg shadow-2xl shadow-white/10 w-full sm:w-auto" asChild>
                <a href="/login">
                  Try <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-zinc-800 hover:bg-zinc-900 text-black dark:text-white hover:text-white rounded-full px-8 py-6 text-lg w-full sm:w-auto">
                Explore Features
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why TRACIA Section */}
      <section id="about-us" className="py-24 relative z-10 overflow-hidden bg-transparent">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Why TRACIA?</h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              An integrated AI solution to detect dropout risks early, improve retention, and support student growth across the ASEAN region.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                title: "Data-Driven Empathy", 
                desc: "Understand student needs through data, never through judgment.",
                icon: <Target className="w-6 h-6 text-indigo-400" />
              },
              { 
                title: "Seamless Integration", 
                desc: "Compatible and smooth integration with existing Learning Management Systems.",
                icon: <Zap className="w-6 h-6 text-purple-400" />
              },
              { 
                title: "Proactive Guidance", 
                desc: "Intervene and support before academic issues escalate into dropout risks.",
                icon: <Shield className="w-6 h-6 text-blue-400" />
              },
              { 
                title: "Inclusive Support", 
                desc: "Ensure equitable access for students of all backgrounds and abilities.",
                icon: <Users className="w-6 h-6 text-emerald-400" />
              },
              { 
                title: "Collaborative Ecosystem", 
                desc: "Foster synergy between faculty, staff, and students for shared success.",
                icon: <Globe className="w-6 h-6 text-amber-400" />
              },
              { 
                title: "Future-Ready Campus", 
                desc: "Build long-term academic resilience for evolving educational needs.",
                icon: <Smartphone className="w-6 h-6 text-rose-400" />
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <SpotlightCard 
                  className="h-full bg-zinc-900/50 border-zinc-800 hover:border-indigo-500/50 transition-all duration-300 group"
                  spotlightColor="rgba(0, 229, 255, 0.2)"
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative z-10 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Key Features</h2>
            <p className="text-zinc-400">Intelligent solutions to drive student success and institutional growth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
            <div className="space-y-8">
              {[
                {
                  title: "Dropout Prediction",
                  desc: "Proactively identify at-risk students early using advanced, high-accuracy AI modeling.",
                  icon: <BrainCircuit className="w-8 h-8 text-indigo-500" />
                },
                {
                  title: "Actionable Nudges",
                  desc: "Empower faculty with automated, timely triggers for effective student intervention.",
                  icon: <BellRing className="w-8 h-8 text-purple-500" />
                },
                {
                  title: "Recovery Quest",
                  desc: "Boost retention by transforming academic recovery into personalized, motivating challenges.",
                  icon: <Target className="w-8 h-8 text-blue-500" />
                },
                {
                  title: "Lecturer Dashboard",
                  desc: "Provide faculty with transparent, data-driven insights into core risk scores and trends.",
                  icon: <LayoutDashboard className="w-8 h-8 text-emerald-500" />
                },
                {
                  title: "Explainable AI",
                  desc: "Understand the 'why' behind every prediction with transparent, interpretable AI modeling.",
                  icon: <BrainCircuit className="w-8 h-8 text-rose-500" />
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-6 rounded-2xl bg-transparent border border-transparent hover:bg-zinc-900/30 hover:border-zinc-800 transition-all">
                  <div className="flex-shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
              <img src="https://placehold.co/1322x741" alt="Dashboard Preview" className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                 <div className="text-center p-8">
                   <h4 className="text-3xl font-bold mb-2 uppercase tracking-widest">Dashboard Overview</h4>
                   <p className="text-zinc-300">Intelligent Dashboards for Faculty and Staff</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ASEAN Universities Section */}
      <section className="py-24 bg-transparent border-y border-zinc-900/40 overflow-visible relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative min-h-[220vh] max-w-6xl mx-auto">
            {/* Left Column: Titles and Active Country Display */}
            <div className="lg:col-span-6 self-stretch relative flex flex-col justify-start">
              <div className="lg:sticky lg:top-[calc(50vh-180px)] pt-10 lg:pt-0 text-left">
                <span className="text-indigo-400 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
                  Targeted for Universities across ASEAN
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-10 leading-tight text-white">
                  Empowering <br />Higher Education
                </h2>
                
                {/* Dynamic Country Display */}
                <div className="flex items-center bg-transparent">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
                      Designed for
                    </span>
                    <motion.h3 
                      key={`country-${activeUni.country}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-3xl md:text-4xl font-extrabold text-white leading-none tracking-tight"
                    >
                      {activeUni.country}
                    </motion.h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: ScrollStack showing flags and universities */}
            <div className="lg:col-span-6 h-full">
              <ScrollStack
                useWindowScroll={true}
                itemDistance={100}
                stackPosition="30%"
                itemStackDistance={20}
                className="!h-auto !overflow-visible"
                onActiveIndexChange={(index) => {
                  setActiveUniId(index + 1);
                }}
              >
                {universities.map((uni, i) => (
                  <ScrollStackItem key={i} itemClassName="h-[220px] md:h-[260px] my-0 p-0 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
                    <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
                      <img 
                        src={`https://flagcdn.com/w640/${uni.flag}.png`} 
                        alt={uni.country} 
                        className="w-full h-full object-cover opacity-80 bg-zinc-950" 
                        decoding="async"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-1 text-left">
                        <span className="text-2xl font-extrabold text-white tracking-wide uppercase">{uni.country}</span>
                      </div>
                    </div>
                  </ScrollStackItem>
                ))}
              </ScrollStack>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works with ScrollStack */}
      <section className="py-24 bg-transparent overflow-visible relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start relative min-h-[180vh]">
            {/* Left Column: ScrollStack */}
            <div className="order-2 lg:order-1 h-full">
              <ScrollStack 
                useWindowScroll={true} 
                itemDistance={100} 
                stackPosition="30%"
                itemStackDistance={20}
                className="!h-auto !overflow-visible"
              >
                <ScrollStackItem itemClassName="bg-indigo-600 border border-white/10 flex items-center h-[350px] md:h-[400px]">
                  <div className="p-8">
                    <span className="text-indigo-200 text-sm font-bold mb-4 block uppercase tracking-widest">Step 01</span>
                    <h2 className="text-4xl font-bold mb-6">Sync LMS Data</h2>
                    <p className="text-indigo-100 text-lg md:text-xl leading-relaxed">Effortlessly integrate TRACIA with your existing Learning Management System to create a unified, real-time data stream of student engagement and academic performance.</p>
                  </div>
                </ScrollStackItem>
                <ScrollStackItem itemClassName="bg-purple-600 border border-white/10 flex items-center h-[350px] md:h-[400px]">
                  <div className="p-8">
                    <span className="text-purple-200 text-sm font-bold mb-4 block uppercase tracking-widest">Step 02</span>
                    <h2 className="text-4xl font-bold mb-6">Predict Risks</h2>
                    <p className="text-purple-100 text-lg md:text-xl leading-relaxed">Leverage our advanced predictive modeling to identify at-risk students early and pinpoint the specific performance drivers behind their academic trajectory.</p>
                  </div>
                </ScrollStackItem>
                <ScrollStackItem itemClassName="bg-blue-600 border border-white/10 flex items-center h-[350px] md:h-[400px]">
                  <div className="p-8">
                    <span className="text-blue-200 text-sm font-bold mb-4 block uppercase tracking-widest">Step 03</span>
                    <h2 className="text-4xl font-bold mb-6">Take Action</h2>
                    <p className="text-blue-100 text-lg md:text-xl leading-relaxed">Empower faculty to provide targeted support through automated, personalized nudges and engaging recovery quests, turning academic challenges into pathways for growth.</p>
                  </div>
                </ScrollStackItem>
              </ScrollStack>
            </div>

            {/* Right Column: Sticky Text */}
            <div className="order-1 lg:order-2 self-stretch relative">
              <div className="lg:sticky lg:top-48 pt-10 lg:pt-0">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                    Start Empowering <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Your Students</span>
                  </h2>
                  <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
                    Our seamless process to get you up and running. We bridge the gap between institutional goals and student success through a proactive ecosystem.
                  </p>
                  <div className="space-y-6">
                    {[
                      "High-accuracy AI modeling",
                      "Real-time LMS integration",
                      "Automated intervention triggers"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-zinc-300">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-lg">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-transparent relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">TRACIA Pricing Plan</h2>
            <p className="text-zinc-400">Flexible plans tailored for institutions of all sizes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan 1: Demo (Free) */}
            <BorderGlow
              className="flex flex-col h-full relative overflow-hidden group"
              edgeSensitivity={30}
              glowColor="260 80 80"
              backgroundColor="#0a0a0a"
              borderRadius={24}
              glowRadius={50}
              glowIntensity={0.8}
            >
               <div className="p-4 flex flex-col h-full">
                 <CardHeader>
                   <CardTitle className="text-2xl text-white">Demo</CardTitle>
                   <CardDescription className="text-zinc-400">Experience TRACIA's core features</CardDescription>
                 </CardHeader>
                 <CardContent className="flex-grow">
                   <div className="text-4xl font-bold mb-8 text-white">Free</div>
                   <ul className="space-y-4 mb-8">
                     {['Core risk analytics engine', 'LMS integration demo', 'Standard report export', 'Self-service documentation'].map((feat) => (
                       <li key={feat} className="flex items-center gap-3 text-zinc-300 text-sm">
                         <CheckCircle2 className="w-5 h-5 text-indigo-500" /> {feat}
                       </li>
                     ))}
                   </ul>
                 </CardContent>
                 <div className="p-6 pt-0">
                    <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-black dark:text-white hover:text-white rounded-xl">Try for Free</Button>
                 </div>
               </div>
            </BorderGlow>

            {/* Plan 2: Custom (Contact) */}
            <BorderGlow
              className="flex flex-col h-full relative overflow-hidden group shadow-2xl shadow-indigo-500/10"
              edgeSensitivity={30}
              glowColor="260 80 80"
              backgroundColor="#0a0a0a"
              borderRadius={24}
              glowRadius={60}
              glowIntensity={1}
              colors={['#6366f1', '#a855f7', '#3b82f6']}
            >
               <div className="p-4 flex flex-col h-full">
                 <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase z-20">Recommended</div>
                 <CardHeader>
                   <CardTitle className="text-2xl text-white">Custom</CardTitle>
                   <CardDescription className="text-zinc-400">Tailored for large universities & institutions</CardDescription>
                 </CardHeader>
                 <CardContent className="flex-grow">
                   <div className="text-4xl font-bold mb-8 text-white">Contact Us</div>
                   <ul className="space-y-4 mb-8">
                     {['University-wide integration', 'Custom AI model training', 'Dedicated success manager', '24/7 dedicated support'].map((feat) => (
                       <li key={feat} className="flex items-center gap-3 text-zinc-300 text-sm">
                         <CheckCircle2 className="w-5 h-5 text-indigo-500" /> {feat}
                       </li>
                     ))}
                   </ul>
                 </CardContent>
                 <div className="p-6 pt-0">
                   <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Contact Our Team</Button>
                 </div>
               </div>
            </BorderGlow>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-transparent relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8">Get in Touch with TRACIA</h2>
              <p className="text-lg text-zinc-400 mb-12 leading-relaxed">
                Let’s collaborate to build a more supportive campus ecosystem. Discuss your institution's needs with our team and let’s shape the future of data-driven education together.
              </p>
              
              <div className="space-y-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span className="text-zinc-300">anomalynpc@mbuh.com</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span className="text-zinc-300">+62 857-0738-1852</span>
                </div>
              </div>

              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-8 py-7 text-lg flex gap-3 h-auto shadow-xl shadow-emerald-600/10">
                <MessageCircle className="w-6 h-6" /> Chat via WhatsApp
              </Button>
            </div>

            <Card className="bg-zinc-900 border-zinc-800 p-8">
              <h3 className="text-2xl font-bold mb-8">Contact Form</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Full Name <span className="text-red-500">*</span></label>
                    <Input placeholder="Your Name" className="bg-zinc-800 border-zinc-700 focus:border-indigo-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Email <span className="text-red-500">*</span></label>
                    <Input placeholder="email@university.ac.id" className="bg-zinc-800 border-zinc-700 focus:border-indigo-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Phone Number <span className="text-red-500">*</span></label>
                  <Input placeholder="0812xxxxxxxx" className="bg-zinc-800 border-zinc-700 focus:border-indigo-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Message <span className="text-red-500">*</span></label>
                  <textarea 
                    className="w-full h-32 bg-zinc-800 border-zinc-700 focus:border-indigo-500 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                    placeholder="Tell us about your needs..."
                  />
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-xl font-bold text-lg shadow-xl shadow-indigo-600/20">
                  Send Inquiry
                </Button>
                <p className="text-xs text-zinc-500 text-center">
                  Your information will be kept confidential and will only be used for TRACIA partnership coordination purposes.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-transparent border-t border-zinc-900/40 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img src="/favicon.ico" alt="TRACIA Logo" className="w-8 h-8 object-contain" />
                <span className="font-bold text-xl tracking-tight">TRACIA</span>
              </div>
              <p className="text-sm text-zinc-400 italic leading-relaxed">
                Empowering Student Success with Predictive Analytics. TRACIA is an AI-driven platform designed to support universities in predicting student dropout risks and fostering proactive student growth.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4">
                {['Home', 'About Us', 'Features', 'Pricing', 'Contact'].map((link) => (
                  <li key={link}><a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="space-y-4">
                {['Feedback', 'Help Center', 'Terms of Service', 'Privacy Policy'].map((link) => (
                  <li key={link}><a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold mb-6">Contact Details</h4>
              <div className="space-y-4 text-sm text-zinc-400">
                <p>Jl. Penanggungan No. 41a, Bandar Lor, Mojoroto District, Kediri City, East Java 64129, Indonesia</p>
                <p>+62 857-0738-1852</p>
                <p>anomalynpc@mbuh.com</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-zinc-900 gap-4">
            <p className="text-sm text-zinc-500">© 2026 TRACIA. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {[
                { 
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white transition-colors">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                  ), 
                  href: "https://github.com/tracia-AI" 
                },
                { 
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white transition-colors">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  ), 
                  href: "#" 
                },
                { 
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white transition-colors">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  ), 
                  href: "#" 
                },
                { 
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white transition-colors">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  ), 
                  href: "#" 
                }
              ].map((item, i) => (
                <a 
                  key={i} 
                  href={item.href} 
                  target={item.href !== "#" ? "_blank" : undefined}
                  rel={item.href !== "#" ? "noopener noreferrer" : undefined}
                  className="w-9 h-9 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300 group cursor-pointer"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
