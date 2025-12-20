import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export const SparklesCore = ({
  id,
  className,
  background,
  minSize,
  maxSize,
  speed,
  particleColor,
  particleDensity,
}) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const controls = {
    particles: {
      number: {
        value: particleDensity || 120,
        density: {
          enable: true,
          width: 800,
          height: 800,
        },
      },
      color: {
        value: particleColor || "#FFFFFF",
      },
      move: {
        enable: true,
        speed: speed || 4,
        direction: "none",
        random: false,
        straight: false,
        outModes: {
          default: "out",
        },
      },
      size: {
        value: {
          min: minSize || 1,
          max: maxSize || 3,
        },
        animation: {
          enable: false,
          speed: 5,
          sync: false,
        },
      },
      opacity: {
        value: {
          min: 0.1,
          max: 1,
        },
        animation: {
          enable: true,
          speed: 1,
          sync: false,
        },
      },
      shape: {
        type: "circle",
      },
    },
    detectRetina: true,
    background: {
       color: {
           value: "transparent"
       }
    }
  };

  return (
    init && (
      <Particles
        id={id || "tsparticles"}
        className={className}
        options={controls}
      />
    )
  );
};
