import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToastType } from '@/src/context/ToastContext';

const { width } = Dimensions.get('window');

interface ToastProps {
  type: ToastType;
  message: string;
  visible: boolean;
  onHide: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const TOAST_CONFIG = {
  success: {
    icon: 'checkmark-circle' as const,
    iconColor: '#10B981',
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    textColor: '#065F46',
  },
  error: {
    icon: 'close-circle' as const,
    iconColor: '#EF4444',
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    textColor: '#991B1B',
  },
  warning: {
    icon: 'warning' as const,
    iconColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    textColor: '#92400E',
  },
  info: {
    icon: 'information-circle' as const,
    iconColor: '#3B82F6',
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
    textColor: '#1E40AF',
  },
};

export default function Toast({ type, message, visible, onHide, action }: ToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const config = TOAST_CONFIG[type];

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  if (!visible && slideAnim._value === -100) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: config.backgroundColor,
            borderLeftColor: config.borderColor,
          },
        ]}
      >
        <Ionicons name={config.icon} size={24} color={config.iconColor} />

        <Text style={[styles.message, { color: config.textColor }]} numberOfLines={3}>
          {message}
        </Text>

        {action && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: config.borderColor }]}
            onPress={() => {
              action.onPress();
              onHide();
            }}
          >
            <Text style={[styles.actionText, { color: config.textColor }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onHide} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={config.textColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: width - 32,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    marginLeft: 12,
    marginRight: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    marginRight: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
});
