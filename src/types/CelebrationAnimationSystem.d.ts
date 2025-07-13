declare module '../lib/CelebrationAnimationSystem' {
  export interface AnimationConfig {
    type: 'confetti' | 'fireworks' | 'stars' | 'sparkles' | 'rain' | 'snow';
    duration?: number;
    intensity?: 'low' | 'medium' | 'high';
    colors?: string[];
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    gravity?: number;
    decay?: number;
    drift?: number;
    ticks?: number;
    origin?: { x: number; y: number };
    zIndex?: number;
    onComplete?: () => void;
  }

  export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    alpha: number;
    decay: number;
    drift: number;
  }

  export default class CelebrationAnimationSystem {
    constructor(options?: {
      container?: HTMLElement | null;
      autoStart?: boolean;
      debug?: boolean;
    });

    // Animation control
    start(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    isRunning(): boolean;
    
    // Animation management
    play(config: AnimationConfig | AnimationConfig[]): string[];
    stopAnimation(id: string): void;
    stopAllAnimations(): void;
    
    // Configuration
    setContainer(container: HTMLElement): void;
    setFPS(fps: number): void;
    setSize(width: number, height: number): void;
    
    // Event handling
    on(event: 'start' | 'stop' | 'complete', callback: () => void): void;
    off(event: 'start' | 'stop' | 'complete', callback: () => void): void;
    
    // Utility methods
    clear(): void;
    resize(): void;
    destroy(): void;
  }
}
