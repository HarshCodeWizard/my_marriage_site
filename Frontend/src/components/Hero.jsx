import React, { useEffect } from 'react';

function Hero() {
  useEffect(() => {
    
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://unpkg.com/split-type';
    document.body.appendChild(script2);

    script2.onload = () => {
      const animatedTextElement = document.getElementById('animatedText');

    
      const split = new window.SplitType(animatedTextElement, { types: 'words, chars' });

      const animateText = () => {
        
        window.gsap.set(split.chars, { opacity: 0, y: 50 });

        
        window.gsap.fromTo(
          split.chars, 
          { opacity: 0, y: 50 },
          {
            duration: 1,
            opacity: 1,
            y: 0,
            stagger: 0.05,
            onComplete: () => {
              
              window.gsap.to(split.chars, { opacity: 0, delay: 1, duration: 0.5 });
            }
          }
        );
      };

      
      animateText();

      
      const intervalId = setInterval(animateText, 5000);

      return () => {
        
        clearInterval(intervalId);
        document.body.removeChild(script1);
        document.body.removeChild(script2);
      };
    };
  }, []);

  return (
    
    <div className="w-screen max-w-full h-screen bg-cover bg-center relative overflow-hidden"
     style={{backgroundImage: "url('/m1.jpg')"}}>
  <div className="absolute left-4 md:left-[90px] top-[20vh] max-w-[90%] md:max-w-[80%] px-4">
    <div className="w-full">
      <h1 id="animatedText" className="text-white text-3xl md:text-5xl font-serif leading-relaxed break-words m-3">
        Two hearts, <br />
        one love,one beautiful day <br />
        
      </h1>
    </div>
  </div>
</div>
    
  );
}

export default Hero;
