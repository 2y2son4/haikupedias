/**
 * Web Audio API context wrapper
 * Handles browser compatibility and autoplay policies
 */

export class AudioContextManager {
  private audioContext: AudioContext | null = null;
  private initialized = false;

  /**
   * Initialize the Web Audio context
   * Must be called in response to user interaction due to browser autoplay policies
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const AudioContextClass = window.AudioContext ||
        (window as unknown as Record<string, typeof AudioContext>)['webkitAudioContext'];
      this.audioContext = new AudioContextClass();

      // Resume context if it's suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw new Error('Web Audio API not supported');
    }
  }

  /**
   * Get the audio context instance
   * @throws Error if context is not initialized
   */
  getContext(): AudioContext {
    if (!this.audioContext) {
      throw new Error(
        'Audio context not initialized. Call initialize() first.',
      );
    }
    return this.audioContext;
  }

  /**
   * Check if audio context is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Suspend audio context (pause all audio processing)
   */
  async suspend(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'running') {
      await this.audioContext.suspend();
    }
  }

  /**
   * Resume audio context
   */
  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Close and cleanup audio context
   */
  async close(): Promise<void> {
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
      this.initialized = false;
    }
  }
}
