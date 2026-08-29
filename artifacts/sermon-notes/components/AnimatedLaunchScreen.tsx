import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import { BACKGROUND_URI, THORN_URI } from '@/components/launchAssets';

type Particle = {
  left: `${number}%`;
  top: `${number}%`;
  size: number;
};

export function AnimatedLaunchScreen({ ready, onFinished }: { ready: boolean; onFinished: () => void }) {
  const [minimumTimeDone, setMinimumTimeDone] = useState(false);
  const [exiting, setExiting] = useState(false);

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const backgroundScale = useRef(new Animated.Value(1.01)).current;
  const backgroundShift = useRef(new Animated.Value(0)).current;
  const crownOpacity = useRef(new Animated.Value(0)).current;
  const crownScale = useRef(new Animated.Value(0.72)).current;
  const crownRotate = useRef(new Animated.Value(0)).current;
  const haloScale = useRef(new Animated.Value(0.82)).current;
  const haloOpacity = useRef(new Animated.Value(0)).current;
  const captionOpacity = useRef(new Animated.Value(0)).current;
  const particlePhase = useRef(new Animated.Value(0)).current;

  const particles = useMemo<Particle[]>(
    () => [
      { left: '12%', top: '21%', size: 3 },
      { left: '78%', top: '17%', size: 4 },
      { left: '23%', top: '69%', size: 2 },
      { left: '86%', top: '62%', size: 3 },
      { left: '56%', top: '13%', size: 2 },
      { left: '66%', top: '77%', size: 3 },
    ],
    []
  );

  useEffect(() => {
    const minimumTimer = setTimeout(() => setMinimumTimeDone(true), 2450);

    Animated.timing(screenOpacity, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(backgroundScale, {
      toValue: 1.105,
      duration: 4200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    Animated.timing(backgroundShift, {
      toValue: 1,
      duration: 4300,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(crownOpacity, {
        toValue: 1,
        duration: 720,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(crownScale, {
        toValue: 1,
        delay: 180,
        speed: 7,
        bounciness: 5,
        useNativeDriver: true,
      }),
      Animated.timing(captionOpacity, {
        toValue: 1,
        duration: 650,
        delay: 820,
        useNativeDriver: true,
      }),
    ]).start();

    const rotationLoop = Animated.loop(
      Animated.timing(crownRotate, {
        toValue: 1,
        duration: 11500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotationLoop.start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(crownScale, {
            toValue: 1.045,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(haloScale, {
            toValue: 1.18,
            duration: 1250,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(haloOpacity, {
            toValue: 0.34,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(crownScale, {
            toValue: 0.985,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(haloScale, {
            toValue: 0.92,
            duration: 1250,
            easing: Easing.in(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(haloOpacity, {
            toValue: 0.08,
            duration: 950,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    const pulseTimer = setTimeout(() => pulseLoop.start(), 850);

    const particleLoop = Animated.loop(
      Animated.timing(particlePhase, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    );
    particleLoop.start();

    return () => {
      clearTimeout(minimumTimer);
      clearTimeout(pulseTimer);
      rotationLoop.stop();
      pulseLoop.stop();
      particleLoop.stop();
    };
  }, [backgroundScale, backgroundShift, captionOpacity, crownOpacity, crownRotate, crownScale, haloOpacity, haloScale, particlePhase, screenOpacity]);

  useEffect(() => {
    if (!ready || !minimumTimeDone || exiting) return;
    setExiting(true);

    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 520,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(crownScale, {
        toValue: 1.14,
        duration: 520,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onFinished());
  }, [ready, minimumTimeDone, exiting, onFinished, screenOpacity, crownScale]);

  const backgroundTranslateX = backgroundShift.interpolate({
    inputRange: [0, 1],
    outputRange: [-7, 7],
  });
  const rotation = crownRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-4deg', '356deg'],
  });

  return (
    <Animated.View pointerEvents="auto" style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.Image
        source={{ uri: BACKGROUND_URI }}
        resizeMode="cover"
        style={[
          styles.background,
          { transform: [{ scale: backgroundScale }, { translateX: backgroundTranslateX }] },
        ]}
      />
      <View style={styles.darkOverlay} />
      <View style={styles.vignetteTop} />
      <View style={styles.vignetteBottom} />

      {particles.map((particle, index) => {
        const drift = particlePhase.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, index % 2 === 0 ? -8 : 8, 0],
        });
        const opacity = particlePhase.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.08, 0.42, 0.08],
        });
        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                borderRadius: particle.size,
                opacity,
                transform: [{ translateY: drift }],
              },
            ]}
          />
        );
      })}

      <View style={styles.centerStage}>
        <Animated.View
          style={[
            styles.halo,
            { opacity: haloOpacity, transform: [{ scale: haloScale }] },
          ]}
        />
        <Animated.View
          style={{
            opacity: crownOpacity,
            transform: [{ scale: crownScale }, { rotate: rotation }],
          }}
        >
          <Image source={{ uri: THORN_URI }} resizeMode="contain" style={styles.thorn} />
        </Animated.View>

        <Animated.View style={[styles.copy, { opacity: captionOpacity }]}>
          <View style={styles.rule} />
          <Text style={styles.caption}>PREPARING YOUR SPACE</Text>
          <View style={styles.loadingDots}>
            <LoadingDot delay={0} />
            <LoadingDot delay={180} />
            <LoadingDot delay={360} />
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function LoadingDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.18)).current;
  const scale = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    const timer = setTimeout(() => {
      animation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0.9, duration: 440, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1.15, duration: 440, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0.18, duration: 440, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 0.75, duration: 440, useNativeDriver: true }),
          ]),
        ])
      );
      animation.start();
    }, delay);
    return () => {
      clearTimeout(timer);
      animation?.stop();
    };
  }, [delay, opacity, scale]);

  return <Animated.View style={[styles.loadingDot, { opacity, transform: [{ scale }] }]} />;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: '#060806',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    left: -18,
    top: -18,
    width: '110%',
    height: '110%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 8, 6, 0.54)',
  },
  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '38%',
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  centerStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  halo: {
    position: 'absolute',
    width: 224,
    height: 224,
    borderRadius: 112,
    borderWidth: 1,
    borderColor: 'rgba(231, 225, 207, 0.5)',
    backgroundColor: 'rgba(225, 217, 191, 0.035)',
  },
  thorn: {
    width: 190,
    height: 190,
    tintColor: '#F2EFE4',
  },
  copy: {
    alignItems: 'center',
    marginTop: 29,
    gap: 11,
  },
  rule: {
    width: 34,
    height: 1,
    backgroundColor: 'rgba(242, 239, 228, 0.52)',
  },
  caption: {
    color: 'rgba(248, 246, 238, 0.82)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.25,
  },
  loadingDots: {
    height: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F4F0E4',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#FFFDF3',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
});