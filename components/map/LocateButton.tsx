import { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, TouchableOpacity } from "react-native";

type Props = {
  isLocating: boolean;
  onPress: () => void;
};

export function LocateButton({ isLocating, onPress }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLocating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isLocating]);

  return (
    <TouchableOpacity
      style={[styles.button, isLocating && styles.buttonActive]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isLocating}
    >
      <Animated.Text style={[styles.icon, { opacity: pulseAnim }]}>
        {isLocating ? "⌛" : "◎"}
      </Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fff",
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
      },
      android: { elevation: 5 },
    }),
  },
  buttonActive: {
    backgroundColor: "#fff3e8",
  },
  icon: {
    fontSize: 22,
    color: "#1a73e8",
  },
});
