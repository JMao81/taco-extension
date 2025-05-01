// js/agents/jsAgent.js

/**
 * Make all .taco-logo images bounce-and-rotate (“dance”).
 * @param {{ duration?: string, repeat?: string }} [opts]
 *    duration: CSS time (e.g. "2s"), default "3s"
 *    repeat: CSS iteration count (e.g. "infinite" or "5"), default "infinite"
 */
export function danceLogo(opts = {}) {
    const { duration = "3s", repeat = "infinite" } = opts;
  
    // 1) Ensure our keyframes + class are only injected once
    if (!document.getElementById("jsAgent-danceLogo-styles")) {
      const style = document.createElement("style");
      style.id = "jsAgent-danceLogo-styles";
      style.textContent = `
        @keyframes tacoLogoDance {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25%       { transform: translateY(-10px) rotate(-15deg); }
          50%       { transform: translateY(0) rotate(0deg); }
          75%       { transform: translateY(-10px) rotate(15deg); }
        }
        .taco-logo--dancing {
          animation-name: tacoLogoDance;
          animation-timing-function: ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }
  
    // 2) Apply the animation to each logo
    const logos = document.querySelectorAll(".taco-logo");
    if (!logos.length) {
      return window.logMessage("jsAgent.danceLogo: no .taco-logo elements found");
    }
    logos.forEach(img => {
      img.classList.add("taco-logo--dancing");
      img.style.animationDuration = duration;
      img.style.animationIterationCount = repeat;
    });
  
    window.logMessage(`jsAgent: danceLogo(duration=${duration}, repeat=${repeat})`);
  }
  
  /**
   * Stop all dancing logos (removes animation class).
   */
  export function stopLogoDance() {
    const logos = document.querySelectorAll(".taco-logo.taco-logo--dancing");
    logos.forEach(img => {
      img.classList.remove("taco-logo--dancing");
      img.style.removeProperty("animation-duration");
      img.style.removeProperty("animation-iteration-count");
    });
    window.logMessage("jsAgent: stopLogoDance()");
  }
  