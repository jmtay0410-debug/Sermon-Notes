import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { BACKGROUND_URI, THORN_URI } from '@/components/launchAssets';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const MINIMUM_INTRO_MS = 4000;
const RING_RADIUS = 45;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

type Spark = {
  left: `${number}%`;
  top: `${number}%`;
  size: number;
  direction: -1 | 1;
};

function CrownProgress({ progress }: { progress: Animated.Value }) {
  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [RING_LENGTH, 0],
  });

  return (
    <Svg pointerEvents="none" width="100%" height="100%" viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
      <Circle
        cx="50"
        cy="50"
        r={RING_RADIUS}
        fill="none"
        stroke="rgba(238, 232, 216, 0.10)"
        strokeWidth="3.2"
      />
      <AnimatedCircle
        cx="50"
        cy="50"
        r={RING_RADIUS}
        fill="none"
        stroke="rgba(219, 161, 67, 0.34)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${RING_LENGTH} ${RING_LENGTH}`}
        strokeDashoffset={dashOffset as never}
        transform="rotate(-90 50 50)"
      />
      <AnimatedCircle
        cx="50"
        cy="50"
        r={RING_RADIUS}
        fill="none"
        stroke="#FFF9E9"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeDasharray={`${RING_LENGTH} ${RING_LENGTH}`}
        strokeDashoffset={dashOffset as never}
        transform="rotate(-90 50 50)"
      />
    </Svg>
  );
}

export function AnimatedLaunchScreen({ ready, onFinished }: { ready: boolean; onFinished: () => void }) {
  const [minimumTimeDone, setMinimumTimeDone] = useState(false);
  const [completing, setCompleting] = useState(false);

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const backgroundScale = useRef(new Animated.Value(1)).current;
  const crownScale = useRef(new Animated.Value(0.91)).current;
  const crownOpacity = useRef(new Animated.Value(0)).current;
  const copyOpacity = useRef(new Animated.Value(0)).current;
  const thornProgress = useRef(new Animated.Value(0)).current;
  const completionGlow = useRef(new Animated.Value(0)).current;
  const ambientGlow = useRef(new Animated.Value(0.18)).current;
  const sparkPhase = useRef(new Animated.Value(0)).current;

  const sparks = useMemo<Spark[]>(
    () => [
      { left: '18%', top: '72%', size: 2, direction: -1 },
      { left: '82%', top: '76%', size: 3, direction: 1 },
      { left: '28%', top: '84%', size: 2, direction: 1 },
      { left: '72%', top: '86%', size: 2, direction: -1 },
      { left: '42%', top: '78%', size: 2, direction: -1 },
      { left: '61%', top: '82%', size: 3, direction: 1 },
      { left: '34%', top: '49%', size: 2, direction: 1 },
      { left: '68%', top: '47%', size: 2, direction: -1 },
    ],
    []
  );

  useEffect(() => {
    const minimumTimer = setTimeout(() => setMinimumTimeDone(true), MINIMUM_INTRO_MS);

    Animated.timing(screenOpacity, {
      toValue: 1,
      duration: 340,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(backgroundScale, {
      toValue: 1.025,
      duration: 5200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(crownOpacity, {
        toValue: 1,
        delay: 180,
        duration: 720,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(crownScale, {
        toValue: 1,
        delay: 160,
        speed: 6,
        bounciness: 3,
        useNativeDriver: true,
      }),
      Animated.timing(copyOpacity, {
        toValue: 1,
        delay: 600,
        duration: 950,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(thornProgress, {
      toValue: 0.9,
      duration: 3650,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(crownScale, {
            toValue: 1.022,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(ambientGlow, {
            toValue: 0.42,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(crownScale, {
            toValue: 0.993,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(ambientGlow, {
            toValue: 0.16,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    const breatheTimer = setTimeout(() => breatheLoop.start(), 850);

    const sparkLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkPhase, {
          toValue: 1,
          duration: 1750,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sparkPhase, {
          toValue: 0,
          duration: 1750,
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
  }, [ambientGlow, backgroundScale, copyOpacity, crownOpacity, crownScale, screenOpacity, sparkPhase, thornProgress]);

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
            toValue: 0.92,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(crownScale, {
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
          Animated.timing(crownScale, {
            toValue: 1.095,
            duration: 520,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => onFinished());
    });
  }, [ready, minimumTimeDone, completing, thornProgress, completionGlow, crownScale, screenOpacity, onFinished]);

  return (
    <Animated.View pointerEvents="auto" style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.Image
        source={{ uri: BACKGROUND_URI }}
        resizeMode="cover"
        style={[styles.background, { transform: [{ scale: backgroundScale }] }]}
      />
      <View style={styles.cinematicShade} />

      {sparks.map((spark, index) => {
        const translateY = sparkPhase.interpolate({
          inputRange: [0, 1],
          outputRange: [0, spark.direction * -12],
        });
        const opacity = sparkPhase.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.08, 0.52, 0.1],
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

      <Animated.View
        style={[
          styles.crownStage,
          { opacity: crownOpacity, transform: [{ scale: crownScale }] },
        ]}
      >
        <Animated.View style={[styles.ambientHalo, { opacity: ambientGlow }]} />
        <Animated.View style={[styles.completionHalo, { opacity: completionGlow }]} />
        <Image source={{ uri: THORN_URI }} resizeMode="contain" style={styles.thornArtwork} />
        <CrownProgress progress={thornProgress} />
      </Animated.View>

      <Animated.View style={[styles.copy, { opacity: copyOpacity }]}>
        <Text style={styles.caption}>PREPARING YOUR SPACE</Text>
        <Text style={styles.subtitle}>Capturing truth. Deepening faith.</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: '#020302',
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cinematicShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  crownStage: {
    position: 'absolute',
    top: '38.8%',
    left: '50%',
    marginLeft: -104,
    width: 208,
    height: 208,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thornArtwork: {
    position: 'absolute',
    width: 194,
    height: 194,
    tintColor: '#F8F5EC',
    opacity: 0.88,
  },
  ambientHalo: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(231, 184, 96, 0.46)',
    backgroundColor: 'rgba(226, 170, 72, 0.025)',
    shadowColor: '#E4AF59',
    shadowOpacity: 0.9,
    shadowRadius: 26,
  },
  completionHalo: {
    position: 'absolute',
    width: 204,
    height: 204,
    borderRadius: 102,
    borderWidth: 2,
    borderColor: 'rgba(255, 228, 163, 0.72)',
    backgroundColor: 'rgba(232, 183, 85, 0.05)',
    shadowColor: '#FFD98A',
    shadowOpacity: 0.95,
    shadowRadius: 34,
  },
  copy: {
    position: 'absolute',
    top: '64.8%',
    left: 24,
    right: 24,
    alignItems: 'center',
    gap: 20,
  },
  caption: {
    color: '#F7F4EC',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 4.7,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(240, 236, 225, 0.76)',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.65,
    textAlign: 'center',
  },
  spark: {
    position: 'absolute',
    backgroundColor: '#DFA84F',
    shadowColor: '#E6B55E',
    shadowOpacity: 0.9,
    shadowRadius: 7,
  },
});
