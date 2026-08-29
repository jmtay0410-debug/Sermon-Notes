import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, G, Mask, Path, Polygon, Rect } from 'react-native-svg';

import { BACKGROUND_URI } from '@/components/launchAssets';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const MINIMUM_INTRO_MS = 4000;
const CIRCLE_RADIUS = 40.5;
const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS;
const REMOTE_BACKGROUND =
  'https://images.unsplash.com/photo-1586488619157-e98211550398?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000';

const VINE_A =
  'M50 8 C61 7 71 12 79 20 C87 27 92 38 91 49 C92 60 87 71 79 79 C70 87 60 92 49 91 C38 92 28 87 20 79 C12 71 8 60 9 49 C8 38 13 28 21 20 C29 13 39 9 50 8 Z';
const VINE_B =
  'M49 12 C59 10 69 14 77 22 C85 30 89 40 88 50 C88 60 84 69 76 77 C68 85 58 89 48 88 C38 88 29 84 22 76 C14 68 10 58 12 48 C11 38 16 29 24 22 C31 15 40 12 49 12 Z';
const VINE_C =
  'M47 10 C56 9 64 12 72 17 C81 23 87 31 90 41 C92 51 90 61 84 70 C78 79 69 85 59 89 C49 92 39 90 30 85 C21 80 14 72 11 62 C8 52 10 42 15 33 C20 24 29 17 38 13 C41 12 44 11 47 10 Z';

const THORN_ANGLES = [
  2, 13, 24, 35, 47, 58, 70, 82, 94, 106, 118, 130, 142, 154, 166, 178, 190, 202, 214, 226,
  238, 250, 262, 274, 286, 298, 310, 322, 334, 346,
];

type Spark = {
  left: `${number}%`;
  top: `${number}%`;
  size: number;
  direction: -1 | 1;
};

function ThornCrownShape({ color, opacity = 1, strokeWidth = 1.65 }: { color: string; opacity?: number; strokeWidth?: number }) {
  return (
    <G opacity={opacity}>
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <Path d={VINE_A} strokeWidth={strokeWidth} />
        <Path d={VINE_B} strokeWidth={strokeWidth * 0.86} />
        <Path d={VINE_C} strokeWidth={strokeWidth * 0.62} opacity={0.72} />
      </G>

      {THORN_ANGLES.map((angle, index) => {
        const radians = (angle * Math.PI) / 180;
        const outward = index % 6 !== 2;
        const baseRadius = index % 2 === 0 ? 38.8 : 40.3;
        const length = index % 5 === 0 ? 12 : index % 3 === 0 ? 9.5 : 7.2;
        const lean = ((index % 4) - 1.5) * 0.07;
        const direction = outward ? 1 : -1;
        const tipRadius = baseRadius + direction * length;
        const tipAngle = radians + lean;
        const baseX = 50 + Math.cos(radians) * baseRadius;
        const baseY = 50 + Math.sin(radians) * baseRadius;
        const tipX = 50 + Math.cos(tipAngle) * tipRadius;
        const tipY = 50 + Math.sin(tipAngle) * tipRadius;
        const tangentX = -Math.sin(radians);
        const tangentY = Math.cos(radians);
        const halfWidth = index % 5 === 0 ? 1.7 : 1.15;
        const leftX = baseX + tangentX * halfWidth;
        const leftY = baseY + tangentY * halfWidth;
        const rightX = baseX - tangentX * halfWidth;
        const rightY = baseY - tangentY * halfWidth;

        return (
          <G key={`${angle}-${index}`}>
            <Polygon
              points={`${leftX},${leftY} ${tipX},${tipY} ${rightX},${rightY}`}
              fill={color}
              opacity={0.98}
            />
            {index % 4 === 0 ? (
              <Path
                d={`M ${baseX - tangentX * 1.9} ${baseY - tangentY * 1.9} Q ${baseX + Math.cos(radians) * 2.4} ${baseY + Math.sin(radians) * 2.4} ${baseX + tangentX * 2.1} ${baseY + tangentY * 2.1}`}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth * 0.55}
                strokeLinecap="round"
              />
            ) : null}
          </G>
        );
      })}
    </G>
  );
}

function ThornLoader({ progress, glow }: { progress: Animated.Value; glow: Animated.Value }) {
  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCLE_LENGTH, 0],
  });
  const headRotation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '270deg'],
  });

  return (
    <View style={styles.thornStage}>
      <Animated.View style={[styles.thornGlow, { opacity: glow }]} />

      <Svg width="100%" height="100%" viewBox="0 0 100 100" style={styles.progressSvg}>
        <Defs>
          <Mask id="thorn-progress-mask" x="0" y="0" width="100" height="100">
            <Rect x="0" y="0" width="100" height="100" fill="black" />
            <AnimatedCircle
              cx="50"
              cy="50"
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="white"
              strokeWidth="28"
              strokeLinecap="round"
              strokeDasharray={`${CIRCLE_LENGTH} ${CIRCLE_LENGTH}`}
              strokeDashoffset={dashOffset as never}
              transform="rotate(-90 50 50)"
            />
          </Mask>
        </Defs>

        <ThornCrownShape color="rgba(245, 241, 230, 0.24)" opacity={0.92} strokeWidth={1.75} />

        <G mask="url(#thorn-progress-mask)">
          <ThornCrownShape color="rgba(223, 169, 74, 0.78)" opacity={0.82} strokeWidth={3.2} />
          <ThornCrownShape color="#FFF9EA" strokeWidth={1.9} />
        </G>
      </Svg>

      <Animated.View style={[styles.progressHeadOrbit, { transform: [{ rotate: headRotation }] }]}>
        <View style={styles.progressHead} />
      </Animated.View>
    </View>
  );
}

export function AnimatedLaunchScreen({ ready, onFinished }: { ready: boolean; onFinished: () => void }) {
  const [minimumTimeDone, setMinimumTimeDone] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [backgroundFailed, setBackgroundFailed] = useState(false);

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const backgroundScale = useRef(new Animated.Value(1.02)).current;
  const backgroundShift = useRef(new Animated.Value(0)).current;
  const loaderScale = useRef(new Animated.Value(0.88)).current;
  const copyOpacity = useRef(new Animated.Value(0)).current;
  const thornProgress = useRef(new Animated.Value(0)).current;
  const completionGlow = useRef(new Animated.Value(0.16)).current;
  const sparkPhase = useRef(new Animated.Value(0)).current;

  const sparks = useMemo<Spark[]>(
    () => [
      { left: '14%', top: '68%', size: 2, direction: -1 },
      { left: '27%', top: '78%', size: 2, direction: 1 },
      { left: '41%', top: '72%', size: 3, direction: -1 },
      { left: '63%', top: '80%', size: 2, direction: 1 },
      { left: '78%', top: '70%', size: 3, direction: -1 },
      { left: '88%', top: '84%', size: 2, direction: 1 },
    ],
    []
  );

  useEffect(() => {
    const minimumTimer = setTimeout(() => setMinimumTimeDone(true), MINIMUM_INTRO_MS);

    Animated.timing(screenOpacity, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(backgroundScale, {
        toValue: 1.08,
        duration: 5200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(backgroundShift, {
        toValue: 1,
        duration: 5200,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.spring(loaderScale, {
        toValue: 1,
        delay: 220,
        speed: 7,
        bounciness: 4,
        useNativeDriver: true,
      }),
      Animated.timing(copyOpacity, {
        toValue: 1,
        delay: 760,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(thornProgress, {
      toValue: 0.9,
      duration: 3650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(loaderScale, {
            toValue: 1.025,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(completionGlow, {
            toValue: 0.34,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(loaderScale, {
            toValue: 0.99,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(completionGlow, {
            toValue: 0.14,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    const breatheTimer = setTimeout(() => breatheLoop.start(), 900);

    const sparkLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkPhase, {
          toValue: 1,
          duration: 1650,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sparkPhase, {
          toValue: 0,
          duration: 1650,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    sparkLoop.start();

    return () => {
      clearTimeout(minimumTimer);
      clearTimeout(breatheTimer);
      breatheLoop.stop();
      sparkLoop.stop();
    };
  }, [backgroundScale, backgroundShift, completionGlow, copyOpacity, loaderScale, screenOpacity, sparkPhase, thornProgress]);

  useEffect(() => {
    if (!ready || !minimumTimeDone || completing) return;
    setCompleting(true);

    Animated.timing(thornProgress, {
      toValue: 1,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(completionGlow, {
            toValue: 0.95,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(loaderScale, {
            toValue: 1.055,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(220),
        Animated.parallel([
          Animated.timing(screenOpacity, {
            toValue: 0,
            duration: 520,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(loaderScale, {
            toValue: 1.11,
            duration: 520,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => onFinished());
    });
  }, [ready, minimumTimeDone, completing, thornProgress, completionGlow, loaderScale, screenOpacity, onFinished]);

  const translateY = backgroundShift.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 8],
  });

  return (
    <Animated.View pointerEvents="auto" style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.Image
        source={{ uri: backgroundFailed ? BACKGROUND_URI : REMOTE_BACKGROUND }}
        resizeMode="cover"
        onError={() => setBackgroundFailed(true)}
        style={[styles.background, { transform: [{ scale: backgroundScale }, { translateY }] }]}
      />

      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(0,0,0,0.04)',
          'rgba(0,0,0,0.14)',
          'rgba(0,0,0,0.62)',
          'rgba(2,2,2,0.96)',
        ]}
        locations={[0, 0.32, 0.66, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.edgeVignette} />

      {sparks.map((spark, index) => {
        const translateSpark = sparkPhase.interpolate({
          inputRange: [0, 1],
          outputRange: [0, spark.direction * -12],
        });
        const opacity = sparkPhase.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.12, 0.62, 0.14],
        });
        return (
          <Animated.View
            key={index}
            style={[
              styles.spark,
              {
                left: spark.left,
                top: spark.top,
                width: spark.size,
                height: spark.size,
                borderRadius: spark.size,
                opacity,
                transform: [{ translateY: translateSpark }],
              },
            ]}
          />
        );
      })}

      <View style={styles.content}>
        <Animated.View style={[styles.loaderWrap, { transform: [{ scale: loaderScale }] }]}>
          <View style={styles.goldHaze} />
          <ThornLoader progress={thornProgress} glow={completionGlow} />
        </Animated.View>

        <Animated.View style={[styles.copy, { opacity: copyOpacity }]}>
          <Text style={styles.caption}>PREPARING YOUR SPACE</Text>
          <Text style={styles.subtitle}>Capturing truth. Deepening faith.</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: '#020202',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    left: -12,
    top: -12,
    width: '106%',
    height: '106%',
  },
  edgeVignette: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 28,
    borderColor: 'rgba(0,0,0,0.18)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '30%',
  },
  loaderWrap: {
    width: 278,
    height: 278,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldHaze: {
    position: 'absolute',
    width: 242,
    height: 242,
    borderRadius: 121,
    backgroundColor: 'rgba(224, 174, 84, 0.035)',
    shadowColor: '#E0AE54',
    shadowOpacity: 0.34,
    shadowRadius: 38,
  },
  thornStage: {
    width: 258,
    height: 258,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thornGlow: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    borderColor: 'rgba(231, 183, 88, 0.34)',
    shadowColor: '#E7B758',
    shadowOpacity: 0.9,
    shadowRadius: 30,
  },
  progressSvg: {
    position: 'absolute',
  },
  progressHeadOrbit: {
    position: 'absolute',
    width: 209,
    height: 209,
    alignItems: 'center',
  },
  progressHead: {
    width: 12,
    height: 12,
    marginTop: -6,
    borderRadius: 6,
    backgroundColor: '#FFF7DF',
    shadowColor: '#E8B257',
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  copy: {
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
    paddingHorizontal: 24,
  },
  caption: {
    color: '#FAF7EF',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 4.2,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(239, 235, 225, 0.74)',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.65,
    textAlign: 'center',
  },
  spark: {
    position: 'absolute',
    backgroundColor: '#E4AE4F',
    shadowColor: '#E4AE4F',
    shadowOpacity: 0.85,
    shadowRadius: 7,
  },
});
