/**
 * Type definitions for CelebrationAnimationSystem
 */

declare module './CelebrationAnimationSystem' {
  import { ComponentType } from 'react';

  /**
   * Animation configuration
   */
  export interface AnimationConfig {
    /** Animation duration in milliseconds */
    duration?: number;
    /** Animation delay in milliseconds */
    delay?: number;
    /** Animation easing function */
    easing?: string;
    /** Whether the animation should loop */
    loop?: boolean;
    /** Number of times to play the animation (if loop is false) */
    iterations?: number;
    /** Animation direction */
    direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    /** Animation fill mode */
    fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
    /** Animation play state */
    playState?: 'running' | 'paused';
  }

  /**
   * Particle configuration
   */
  export interface ParticleConfig {
    /** Particle count */
    count?: number;
    /** Particle colors */
    colors?: string[];
    /** Particle size range */
    size?: [number, number];
    /** Particle speed range */
    speed?: [number, number];
    /** Particle lifetime in milliseconds */
    lifetime?: number;
    /** Particle gravity */
    gravity?: number;
    /** Particle shape */
    shape?: 'circle' | 'square' | 'triangle' | 'star' | 'image';
    /** Particle image URL (if shape is 'image') */
    image?: string;
  }

  /**
   * Animation event handler
   */
  export type AnimationEventHandler = (event: {
    /** Event type */
    type: string;
    /** Animation progress (0-1) */
    progress: number;
    /** Current time in milliseconds */
    time: number;
    /** Animation target element */
    target: HTMLElement;
  }) => void;

  /**
   * Animation instance
   */
  export interface AnimationInstance {
    /** Play the animation */
    play: () => void;
    /** Pause the animation */
    pause: () => void;
    /** Stop the animation */
    stop: () => void;
    /** Restart the animation */
    restart: () => void;
    /** Set animation progress (0-1) */
    setProgress: (progress: number) => void;
    /** Add an event listener */
    on: (event: string, handler: AnimationEventHandler) => void;
    /** Remove an event listener */
    off: (event: string, handler: AnimationEventHandler) => void;
    /** Get animation duration in milliseconds */
    getDuration: () => number;
    /** Get animation progress (0-1) */
    getProgress: () => number;
    /** Check if animation is playing */
    isPlaying: () => boolean;
    /** Check if animation is paused */
    isPaused: () => boolean;
    /** Check if animation is stopped */
    isStopped: () => boolean;
  }

  /**
   * Celebration animation types
   */
  export type CelebrationType = 
    | 'confetti'
    | 'fireworks'
    | 'balloons'
    | 'stars'
    | 'hearts'
    | 'sparkles'
    | 'rain'
    | 'snow';

  /**
   * Celebration animation options
   */
  export interface CelebrationOptions {
    /** Animation type */
    type?: CelebrationType | CelebrationType[];
    /** Animation configuration */
    animation?: AnimationConfig;
    /** Particle configuration */
    particles?: ParticleConfig;
    /** Target element or selector */
    target?: string | HTMLElement;
    /** Container element or selector */
    container?: string | HTMLElement;
    /** Whether to automatically start the animation */
    autoplay?: boolean;
    /** Callback when animation completes */
    onComplete?: () => void;
  }

  /**
   * A system for playing celebration animations
   */
  export default class CelebrationAnimationSystem {
    /**
     * Create a new celebration animation system
     * @param options Animation options
     */
    constructor(options?: CelebrationOptions);

    /**
     * Play the celebration animation
     * @param options Optional animation overrides
     */
    play(options?: Partial<CelebrationOptions>): AnimationInstance;

    /**
     * Stop all animations
     */
    stopAll(): void;

    /**
     * Pause all animations
     */
    pauseAll(): void;

    /**
     * Resume all paused animations
     */
    resumeAll(): void;

    /**
     * Register a custom animation type
     * @param name Animation name
     * @param factory Animation factory function
     */
    static registerAnimation(
      name: string, 
      factory: (options: any) => AnimationInstance
    ): void;

    /**
     * Create a React component for the celebration animation
     * @param props Component props
     */
    static Component: ComponentType<CelebrationOptions>;
  }
}
