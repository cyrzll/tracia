import * as React from "react";
import RotatingText from "./rotatingText";
import { motion, AnimatePresence } from "framer-motion";

export default function LoaderOverlay() {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isFinalMessage, setIsFinalMessage] = React.useState(false);
  const rotatingTextRef = React.useRef<any>(null);

  const countries = [
    'Indonesia', 'Malaysia', 'Singapore', 'Thailand', 
    'Vietnam', 'Philippines', 'Brunei', 'Cambodia', 
    'Laos', 'Myanmar', 'Timor-Leste'
  ];
  
  const rotationInterval = 1500; // ms per country
  const totalCountriesTime = countries.length * rotationInterval;
  const finalMessageDelay = 2500; // how long to show "We are tracia"
  
  React.useEffect(() => {
    // 1. Show final message after countries cycle
    const finalTimer = setTimeout(() => {
      setIsFinalMessage(true);
      if (rotatingTextRef.current) rotatingTextRef.current.reset();
    }, totalCountriesTime);

    // 2. Hide overlay after final message delay
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      if (typeof window !== "undefined") {
        (window as any).isLoaderStartExit = true;
        window.dispatchEvent(new CustomEvent("loaderStartExit"));
      }
    }, totalCountriesTime + finalMessageDelay);

    return () => {
      clearTimeout(finalTimer);
      clearTimeout(hideTimer);
    };
  }, [totalCountriesTime, finalMessageDelay]);

  return (
    <AnimatePresence 
      mode="wait"
      onExitComplete={() => {
        if (typeof window !== "undefined") {
          (window as any).isLoaderFinished = true;
          window.dispatchEvent(new CustomEvent("loaderFinished"));
        }
      }}
    >
      {isVisible && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-x-0 top-0 h-[105vh] bg-[#050505] z-[9999] flex items-center justify-center pointer-events-auto"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-7xl font-bold flex items-center gap-4"
          >
            {!isFinalMessage && <span className="text-zinc-500">Hello,</span>}

            <RotatingText
              ref={rotatingTextRef}
              texts={isFinalMessage ? ['We are tracia'] : countries}
              mainClassName={`px-4 sm:px-4 md:px-6 overflow-hidden py-2 sm:py-3 md:py-4 justify-center rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                isFinalMessage ? "bg-indigo-600 text-white" : "bg-cyan-300 text-black"
              }`}
              staggerFrom="last"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-120%", opacity: 0 }}
              staggerDuration={0.037}
              splitLevelClassName="overflow-hidden pb-1 sm:pb-2 md:pb-2"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={rotationInterval}
              splitBy="characters"
              animatePresenceMode="wait"
              auto={!isFinalMessage}
              loop={false}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
