import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

import { BACKGROUND_URI, THORN_URI } from '@/components/launchAssets';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const MINIMUM_INTRO_MS = 4000;
const CIRCLE_RADIUS = 44;
const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS;
const REMOTE_BACKGROUND =
  'https://images.unsplash.com/photo-1586488619157-e98211550398?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000';

type Spark = {
  left: `${number}%`;
  top: `${number}%`;
  size: number;
  direction: -1 | 1;
};

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

      <Image
        source={{ uri: THORN_URI }}
        resizeMode="contain"
        style={[styles.thornImage, styles.thornBase]}
      />

      <Svg width="100%" height="100%" viewBox="0 0 100 100" style={styles.progressSvg}>
        <AnimatedCircle
          cx="50"
          cy="50"
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="rgba(226, 175, 79, 0.30)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${CIRCLE_LENGTH} ${CIRCLE_LENGTH}`}
          strokeDashoffset={dashOffset as never}
          transform="rotate(-90 50 50)"
        />
        <AnimatedCircle
          cx="50"
          cy="50"
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="#FFF9EA"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray={`${CIRCLE_LENGTH} ${CIRCLE_LENGTH}`}
          strokeDashoffset={dashOffset as never}
          transform="rotate(-90 50 50)"
        />
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
    width: 270,
    height: 270,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldHaze: {
    position: 'absolute',
    width: 235,
    height: 235,
    borderRadius: 118,
    backgroundColor: 'rgba(224, 174, 84, 0.035)',
    shadowColor: '#E0AE54',
    shadowOpacity: 0.34,
    shadowRadius: 38,
  },
  thornStage: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thornGlow: {
    position: 'absolute',
    width: 222,
    height: 222,
    borderRadius: 111,
    borderWidth: 2,
    borderColor: 'rgba(231, 183, 88, 0.64)',
    shadowColor: '#E7B758',
    shadowOpacity: 0.9,
    shadowRadius: 26,
  },
  thornImage: {
    position: 'absolute',
    width: 230,
    height: 230,
    tintColor: '#FFF9EA',
  },
  thornBase: {
    opacity: 0.92,
  },
  progressSvg: {
    position: 'absolute',
  },
  progressHeadOrbit: {
    position: 'absolute',
    width: 220,
    height: 220,
    alignItems: 'center',
  },
  progressHead: {
    width: 12,
    height: 12,
    marginTop: -5,
    borderRadius: 6,
    backgroundColor: '#FFF7DF',
    shadowColor: '#E8B257',
    shadowOpacity: 1,
    shadowRadius: 14,
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
