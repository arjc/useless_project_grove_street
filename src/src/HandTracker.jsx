import { useEffect, useRef } from "react";
import {
  FilesetResolver,
  HandLandmarker
} from "@mediapipe/tasks-vision";
import tumblerUrl from "./assets/tumbler.png";
import emptyUrl from "./assets/GLASS/CHAYA_EMPTY.svg";
import lowUrl from "./assets/GLASS/CHAYA_LOW.svg";
import halfUrl from "./assets/GLASS/CHAYA _HALF.svg";
import fullUrl from "./assets/GLASS/CHAYA_FULL.svg";

export default function HandTracker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handLandmarkerRef = useRef(null);

  useEffect(() => {
    let animationFrame;
    let stream;
    let isActive = true;
    let lastDetectionTime = 0;
    let lastResults = null;
    let lastSeenTime = 0;
    let lastFrameTime = performance.now();
    let handPoses = [];
    const glasses = [{ volume: 100 }, { volume: 0 }];
    const teaParticles = [];
    const stateImages = [emptyUrl, lowUrl, halfUrl, fullUrl].map((source) => {
      const image = new Image();
      image.src = source;
      return image;
    });

    const detectionInterval = 50;

    const landmarkGracePeriod = 450;
    // 0 is base bottom of the palm and 10 is the top most of the plam's upper part...
    // const trackedLandmarks = [10, 0];
    const trackedLandmarks = [5, 17];
    const tumblerImage = new Image();
    tumblerImage.src = tumblerUrl;
    tumblerImage.onload = () => {
      if (isActive && lastResults) {
        drawHands(performance.now() - lastSeenTime <= landmarkGracePeriod);
      }
    };

    async function setup() {
      const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm");
      const detectorOptions = {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
        },
        runningMode: "VIDEO",
        numHands: 2,
        // Hand tollerances
        minHandDetectionConfidence: 0.3,
        minHandPresenceConfidence: 0.3,
        minTrackingConfidence: 0.3
      };

      let handLandmarker;

      try {
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          ...detectorOptions,
          baseOptions: {
            ...detectorOptions.baseOptions,
            delegate: "GPU"
          }
        });
      } catch {
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
            ...detectorOptions, baseOptions: { ...detectorOptions.baseOptions, delegate: "CPU"
          }
        });
      }

      if (!isActive) {
        handLandmarker.close();
        return;
      }

      handLandmarkerRef.current = handLandmarker;

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60, max: 60 }
        },
        audio: false
      });

      if (!isActive) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      videoRef.current.srcObject = stream;

      await videoRef.current.play();

      detectHands();
    }

    function detectHands() {
      const video = videoRef.current;
      if (!video || !handLandmarkerRef.current) { animationFrame = requestAnimationFrame(detectHands); return; }

      const now = performance.now();
      const canvas = canvasRef.current;
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      if (video.readyState >= 2 && now - lastDetectionTime >= detectionInterval) {
        lastDetectionTime = now;
        const results = handLandmarkerRef.current.detectForVideo(video, now);

        if (results.landmarks?.length) {
          lastResults = results;
          lastSeenTime = now;
        }

        if (results.landmarks?.length) {
          handPoses = getHandPoses(results, width, height);
        }
      }

      const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;
      updateTea(handPoses, deltaTime, canvas.width, canvas.height);
      drawHands(now - lastSeenTime <= landmarkGracePeriod);
      animationFrame = requestAnimationFrame(detectHands);
    }

    function drawHands(shouldKeepLastResults) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const videoWidth = videoRef.current.videoWidth, videoHeight = videoRef.current.videoHeight;

      if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!handPoses.length || !shouldKeepLastResults) return;

      handPoses.forEach((hand, index) => {
        if (hand) drawChayaGlass(ctx, hand, glasses[index], canvas.width);
      });
      drawTeaParticles(ctx);
    }

    function getHandPoses(results, width, height) {
      const poses = [null, null];

      results.landmarks.slice(0, 2).forEach((hand, detectionIndex) => {
        const handedness = results.handednesses?.[detectionIndex]?.[0]?.categoryName?.toLowerCase();
        const handSlot = handedness === "left" ? 0 : handedness === "right" ? 1 : null;
        if (handSlot === null) return;

        const points = trackedLandmarks.map((landmarkIndex) => hand[landmarkIndex]);
        const firstPoint = { x: points[0].x * width, y: points[0].y * height };
        const secondPoint = { x: points[1].x * width, y: points[1].y * height };
        const handAngle = Math.atan2(secondPoint.y - firstPoint.y, secondPoint.x - firstPoint.x);
        const angle = handAngle - Math.PI / 2;
        const size = Math.max(110, Math.min(Math.hypot(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y) * 3.2, width * 0.3));
        const anchor = getPointBetween(points[0], points[1], width, height);
        const brimDirection = { x: -Math.cos(handAngle), y: -Math.sin(handAngle) };
        poses[handSlot] = {
          anchor,
          size,
          angle,
          brim: { x: anchor.x + brimDirection.x * size * 0.43, y: anchor.y + brimDirection.y * size * 0.43 },
          brimDirection
        };
      });

      return poses;
    }

    function getPointBetween(firstPoint, secondPoint, width, height) {
      return {
        x: ((firstPoint.x + secondPoint.x) / 2) * width,
        y: ((firstPoint.y + secondPoint.y) / 2) * height
      };
    }

    // function drawDistanceOverlay(ctx, firstAnchor, secondAnchor, width, height) {
    //   const deltaX = secondAnchor.x - firstAnchor.x;
    //   const deltaY = secondAnchor.y - firstAnchor.y;
      
    //   const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    //   const midpoint = {
    //     x: (firstAnchor.x + secondAnchor.x) / 2,
    //     y: (firstAnchor.y + secondAnchor.y) / 2
    //   };


    //   const distanceLabel = `${Math.round(distance)}`;
    //   const labelX = midpoint.x;
    //   const labelY = Math.max(34, midpoint.y - height / 12);
    //   const fontSize = Math.max(16, width / 38);

    //   ctx.font = `600 ${fontSize}px ui-monospace, monospace`;
    //   ctx.textAlign = "center";
    //   ctx.textBaseline = "middle";
    //   const labelWidth = ctx.measureText(distanceLabel).width + fontSize * 1.4;

    //   ctx.fillStyle = "#fff3";
    //   roundRect(ctx, labelX - labelWidth / 2, labelY - fontSize, labelWidth, fontSize * 2, fontSize / 2);
    //   ctx.fill();
    //   ctx.fillText(distanceLabel, labelX, labelY);
    // }

    function drawChayaGlass(ctx, hand, glass, width) {
      const stateImage = stateImages[getStateIndex(glass.volume)];
      if (!stateImage.complete || !stateImage.naturalWidth) return;

      ctx.save();
      ctx.translate(hand.anchor.x, hand.anchor.y);
      ctx.rotate(hand.angle);
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = Math.max(8, width / 90);
      ctx.drawImage(stateImage, -hand.size / 4, -hand.size / 2, hand.size * 0.5, hand.size * 0.75);
      ctx.restore();

      // ctx.save();
      // ctx.font = `700 ${Math.max(14, width / 58)}px ui-monospace, monospace`;
      // ctx.textAlign = "center";
      // ctx.textBaseline = "middle";
      // ctx.fillStyle = "rgba(255, 247, 222, 0.95)";
      // ctx.shadowColor = "rgba(25, 12, 4, 0.8)";
      // ctx.shadowBlur = 5;
      // ctx.fillText(`${Math.round(glass.volume)}%`, hand.anchor.x, hand.anchor.y + hand.size * 0.3);
      // ctx.restore();
    }

    function getStateIndex(volume) {
      if (volume <= 0) return 0;
      if (volume < 10) return 1;
      if (volume < 50) return 2;
      return 3;
    }

    function updateTea(poses, deltaTime, width, height) {
      if (!poses[0] || !poses[1]) {
        teaParticles.length = 0;
        return;
      }

      poses.forEach((source, sourceIndex) => {
        if (!source) return;
        const targetIndex = sourceIndex === 0 ? 1 : 0;
        const glass = glasses[sourceIndex];

        // A fuller tumbler must be tilted further before it starts pouring.
        const fillRatio = Math.max(0, Math.min(1, glass.volume / 1));
        const requiredTilt = -0.1;

        if (glass.volume <= 0 || source.brimDirection.y < requiredTilt) return;

        const particleCount = Math.min(16, Math.ceil(deltaTime * 300));
        for (let index = 0; index < particleCount; index += 1) {
          const amount = Math.min(0.6, glass.volume);
          if (amount <= 0) break;

          glass.volume -= amount;
          teaParticles.push({
            x: source.brim.x + (Math.random() - 0.5) * source.size * 0.08,
            y: source.brim.y + (Math.random() - 0.5) * source.size * 0.08,
            velocityX: source.brimDirection.x * source.size * (1.05 + Math.random() * 0.3) + (Math.random() - 0.5) * 25,
            velocityY: source.brimDirection.y * source.size * (1.05 + Math.random() * 0.3) + (Math.random() - 0.5) * 25,
            radius: Math.max(2, width / 360) * (0.7 + Math.random() * 0.8),
            amount,
            targetIndex,
            life: 2.8
          });
        }

      });

      for (let index = teaParticles.length - 1; index >= 0; index -= 1) {
        const particle = teaParticles[index];
        particle.velocityY += height * 3.1 * deltaTime;
        particle.x += particle.velocityX * deltaTime;
        particle.y += particle.velocityY * deltaTime;
        particle.life -= deltaTime;

        const target = poses[particle.targetIndex];
        if (!target) continue;
        const hitRadius = Math.max(18, target.size * 0.14);
        if (Math.hypot(particle.x - target.brim.x, particle.y - target.brim.y) < hitRadius) {
          glasses[particle.targetIndex].volume = Math.min(100, glasses[particle.targetIndex].volume + particle.amount);
          teaParticles.splice(index, 1);
        } else if (particle.life <= 0 || particle.y > height + 40 || particle.x < -40 || particle.x > width + 40) {
          teaParticles.splice(index, 1);
        }
      }
    }

    function drawTeaParticles(ctx) {
      for (const particle of teaParticles) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#cc9457";
        ctx.shadowColor = "#bd7427";
        ctx.shadowBlur = 7;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // function drawLightstick(ctx, x, y, deltaX, deltaY, width) {
    //   const angle = Math.atan2(deltaY, deltaX);
    //   const length = Math.min(width * 0.28, Math.max(width * 0.16, Math.hypot(deltaX, deltaY) * 0.72));
    //   const handleLength = length * 0.28;

    //   ctx.save();
    //   ctx.translate(x, y);
    //   ctx.rotate(angle);
    //   ctx.shadowColor = "#ff3d81";
    //   ctx.shadowBlur = 24;
    //   ctx.fillStyle = "#ff3d81";
    //   roundRect(ctx, -length / 2, -Math.max(7, width / 100), length, Math.max(14, width / 50), width / 100);
    //   ctx.shadowBlur = 0;
    //   ctx.fillStyle = "#f7f4ff";
    //   roundRect(ctx, -length / 2 + handleLength, -Math.max(4, width / 180), length - handleLength, Math.max(8, width / 90), width / 180);
    //   ctx.fillStyle = "#25243a";
    //   roundRect(ctx, -length / 2, -Math.max(9, width / 85), handleLength, Math.max(18, width / 42), width / 100);
    //   ctx.restore();
    // }

    // function roundRect(ctx, x, y, width, height, radius) {
    //   ctx.beginPath();
    //   ctx.roundRect(x, y, width, height, radius);
    // }

    setup();

    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrame);
      stream?.getTracks().forEach((track) => track.stop());
      handLandmarkerRef.current?.close();
    };
  }, []);

  return (
    <div className="hand-tracker">
      <video
        ref={videoRef}
        playsInline
        muted
        />

      <canvas
        ref={canvasRef}
      />

    </div>
  );
}