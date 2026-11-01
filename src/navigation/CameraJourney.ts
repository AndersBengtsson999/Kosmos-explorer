import {PerspectiveCamera, Quaternion, Vector3} from 'three';

/** All positions are in the same Three.js world frame (X, Z, -Y), in light years. */
export const ARRIVAL_DISTANCE = 3;
export function smootherstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export class CameraJourney {
  private startPosition = new Vector3();
  private endPosition = new Vector3();
  private startRotation = new Quaternion();
  private endRotation = new Quaternion();
  readonly target = new Vector3();
  active = false;
  elapsed = 0;
  duration = 1;
  progress = 0;

  start(camera: PerspectiveCamera, target: Vector3) {
    this.startPosition.copy(camera.position);
    this.startRotation.copy(camera.quaternion);
    this.target.copy(target);
    const approach = camera.position.clone().sub(target);
    if (approach.lengthSq() < 1e-12) {
      // An imported target may coincide with the camera. Retreat along its backward axis.
      camera.getWorldDirection(approach).negate();
    }
    approach.normalize();
    this.endPosition.copy(target).addScaledVector(approach, ARRIVAL_DISTANCE);
    const view = camera.clone();
    view.position.copy(this.endPosition);
    // At a pole, a parallel up-vector makes lookAt perturb the viewing direction.
    if (Math.abs(approach.dot(view.up)) > 0.999999) {
      view.up.copy(Math.abs(approach.z) < 0.9 ? new Vector3(0, 0, 1) : new Vector3(1, 0, 0));
    }
    view.lookAt(target);
    this.endRotation.copy(view.quaternion);
    this.duration = Math.min(4.5, Math.max(1.2, this.startPosition.distanceTo(this.endPosition) / 12));
    this.elapsed = 0;
    this.progress = 0;
    this.active = true;
  }

  step(camera: PerspectiveCamera, delta: number) {
    if (!this.active) return false;
    // Do not jump to the end after a suspended tab or a long rendering stall.
    this.elapsed += Math.min(Math.max(delta, 0), 0.05);
    this.progress = Math.min(1, this.elapsed / this.duration);
    const eased = smootherstep(this.progress);
    camera.position.lerpVectors(this.startPosition, this.endPosition, eased);
    camera.quaternion.slerpQuaternions(this.startRotation, this.endRotation, eased);
    if (this.progress === 1) this.active = false;
    return true;
  }

  cancel() { this.active = false; }
}
