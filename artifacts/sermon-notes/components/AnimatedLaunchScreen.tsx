import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Mask, Path, Rect } from 'react-native-svg';

import { BACKGROUND_URI } from '@/components/launchAssets';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const MINIMUM_INTRO_MS = 4000;
const CIRCLE_RADIUS = 40.5;
const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS;

const THORN_ANGLES = [
  0, 13, 28, 42, 58, 73, 89, 105, 119, 135, 151, 166, 181, 197, 214, 229, 244, 260, 276, 291, 307,
  323, 338, 351,
];

const MAIN_VINE =
  'M50 9 C61 8 70 13 79 21 C88 29 92 39 91 50 C91 61 86 71 78 79 C69 87 59 92 48 91 C37 91 27 86 20 78 C12 69 8 59 9 48 C9 37 14 27 22 20 C30 13 40 9 50 9 Z';

const INNER_VINE =
  'M50 12 C60 11 69 16 76 23 C84 31 88 40 87 50 C87 60 83 69 75 76 C67 84 58 88 48 87 C38 87 29 83 22 75 C15 67 11 58 12 48 C12 38 16 29 24 22 C31 15 40 12 50 12 Z';

type Spark = {
  left: `${number}%`;
  top: `${number}%`;
  size: number;
  direction: -1 | 1;
};

function ThornVines({ color, width = 1.9, opacity = 1 }: { color: string; width?: number; opacity?: number }) {
  return (
    <G fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
      <Path d={MAIN_VINE} />
      <Path d={INNER_VINE} />
      {THORN_ANGLES.map((angle, index) => {
        const radians = (angle * Math.PI) / 180;
        const lean = ((index % 3) - 1) * 0.11;
        const innerRadius = index % 2 === 0 ? 36.8 : 38.4;
        const outerRadius = index % 4 === 0 ? 49 : index % 3 === 0 ? 46.5 : 44.5;
        const x1 = 50 + Math.cos(radians) * innerRadius;
        const y1 = 50 + Math.sin(radians) * innerRadius;
        const x2 = 50 + Math.cos(radians + lean) * outerRadius;
        const y2 = 50 + Math.sin(radians + lean) * outerRadius;
        return <Line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </G>
  );
}

function ThornProgress({ progress }: { progress: Animated.Value }) {
  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCLE_LENGTH, 0],
  });

  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 100">
      <Defs>
        <Mask id="thorn-progress-mask" x="0" y="0" width="100" height="100">
          <Rect x="0" y="0" width="100" height="100" fill="black" />
          <AnimatedCircle
            cx="50"
            cy="50"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="white"
            strokeWidth="23"
            strokeLinecap="round"
            strokeDasharray={`${CIRCLE_LENGTH} ${CIRCLE_LENGTH}`}
            strokeDashoffset={dashOffset as never}
            transform="rotate(-90 50 50)"
          />
        </Mask>
      </Defs>

      <ThornVines color="rgba(245, 242, 232, 0.16)" width={1.8} />

      <G mask="url(#thorn-progress-mask)">
        <ThornVines color="rgba(224, 174, 84, 0.56)" width={4.3} opacity={0.68} />
        <ThornVines color="#F8F5EC" width={2.15} />
      </G>
    </Svg>
  );
}

export function AnimatedLaunchScreen({ ready, onFinished }: { ready: boolean; onFinished: () => void }) {
  const [minimumTimeDone, setMinimumTimeDone] = useState(false);
  const [completing, setCompleting] = useState(false);

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const backgroundScale = useRef(new Animated.Value(1)).current;
  const loaderScale = useRef(new Animated.Value(0.88)).current;
  const copyOpacity = useRef(new Animated.Value(0)).current;
  const thornProgress = useRef(new Animated.Value(0)).current;
  const completionGlow = useRef(new Animated.Value(0)).current;
  const sparkPhase = useRef(new Animated.Value(0)).current;

  const sparks = useMemo<Spark[]>(
    () => [
      { left: '29%', top: '42%', size: 2, direction: -1 },
      { left: '70%', top: '45%', size: 3, direction: 1 },
      { left: '25%', top: '57%', size: 2, direction: 1 },
      { left: '76%', top: '61%', size: 2, direction: -1 },
      { left: '39%', top: '70%', size: 2, direction: -1 },
      { left: '64%', top: '72%', size: 3, direction: 1 },
    ],
    []
  );

  useEffect(() => {
    const minimumTimer = setTimeout(() => setMinimumTimeDone(true), MINIMUM_INTRO_MS);

    Animated.timing(screenOpacity, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(backgroundScale, {
      toValue: 1.045,
      duration: 5200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.spring(loaderScale, {
        toValue: 1,
        delay: 180,
        speed: 7,
        bounciness: 4,
        useNativeDriver: true,
      }),
      Animated.timing(copyOpacity, {
        toValue: 1,
        delay: 520,
        duration: 850,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(thornProgress, {
      toValue: 0.88,
      duration: 3600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(loaderScale, {
          toValue: 1.025,
          duration: 1050,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(loaderScale, {
          toValue: 0.99,
          duration: 1050,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const pulseTimer = setTimeout(() => pulseLoop.start(), 900);

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
      clearTimeout(pulseTimer);
      pulseLoop.stop();
      sparkLoop.stop();
    };
  }, [backgroundScale, copyOpacity, loaderScale, screenOpacity, sparkPhase, thornProgress]);

  useEffect(() => {
    if (!ready || !minimumTimeDone || completing) return;
    setCompleting(true);

    Animated.timing(thornProgress, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(completionGlow, {
            toValue: 0.78,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(loaderScale, {
            toValue: 1.045,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(180),
        Animated.parallel([
          Animated.timing(screenOpacity, {
            toValue: 0,
            duration: 480,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(loaderScale, {
            toValue: 1.1,
            duration: 480,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => onFinished());
    });
  }, [ready, minimumTimeDone, completing, thornProgress, completionGlow, loaderScale, screenOpacity, onFinished]);

  return (
    <Animated.View pointerEvents="auto" style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.Image
        source={{ uri: BACKGROUND_URI }}
        resizeMode="cover"
        style={[styles.background, { transform: [{ scale: backgroundScale }] }]}
      />
      <View style={styles.overlay} />

      {sparks.map((spark, index) => {
        const translateY = sparkPhase.interpolate({
          inputRange: [0, 1],
          outputRange: [0, spark.direction * -10],
        });
        const opacity = sparkPhase.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.16, 0.62, 0.2],
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
                transform: [{ translateY }],
              },
            ]}
          />
        );
      })}

      <View style={styles.content}>
        <Animated.View style={[styles.loaderWrap, { transform: [{ scale: loaderScale }] }]}>
          <Animated.View style={[styles.completionHalo, { opacity: completionGlow }]} />
          <ThornProgress progress={thornProgress} />
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
    backgroundColor: '#030403',
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 3, 2, 0.15)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '24%',
  },
  loaderWrap: {
    width: 246,
    height: 246,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionHalo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: 'rgba(232, 184, 92, 0.55)',
    backgroundColor: 'rgba(229, 180, 83, 0.05)',
    shadowColor: '#E6B55E',
    shadowOpacity: 0.72,
    shadowRadius: 26,
  },
  copy: {
    alignItems: 'center',
    marginTop: 34,
    gap: 18,
    paddingHorizontal: 24,
  },
  caption: {
    color: '#F7F4EC',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 4.4,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(238, 234, 224, 0.72)',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.7,
    textAlign: 'center',
  },
  spark: {
    position: 'absolute',
    backgroundColor: '#E6B55E',
    shadowColor: '#E6B55E',
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});
