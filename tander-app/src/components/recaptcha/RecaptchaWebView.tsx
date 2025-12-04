import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { generateRecaptchaHTML, RECAPTCHA_SITE_KEY } from '../../services/recaptchaService';

interface RecaptchaWebViewProps {
  /**
   * Action name for this reCAPTCHA token (e.g., 'verify_id', 'login')
   */
  action: string;

  /**
   * Callback when token is successfully generated
   */
  onToken: (token: string) => void;

  /**
   * Callback when token generation fails
   */
  onError?: (error: string) => void;

  /**
   * Optional custom site key (defaults to test key)
   */
  siteKey?: string;
}

/**
 * Invisible WebView component that generates reCAPTCHA v3 tokens
 * Uses a hidden WebView to execute Google's reCAPTCHA script
 *
 * Usage:
 * ```tsx
 * <RecaptchaWebView
 *   action="verify_id"
 *   onToken={(token) => console.log('Got token:', token)}
 *   onError={(error) => console.error('Error:', error)}
 * />
 * ```
 */
export const RecaptchaWebView: React.FC<RecaptchaWebViewProps> = ({
  action,
  onToken,
  onError,
  siteKey = RECAPTCHA_SITE_KEY,
}) => {
  const webViewRef = useRef<WebView>(null);

  // Generate HTML content with reCAPTCHA script
  const htmlContent = generateRecaptchaHTML(siteKey, action);

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      console.log('📨 [RecaptchaWebView] Received message:', data.type);

      if (data.type === 'recaptcha_token') {
        console.log('✅ [RecaptchaWebView] Token generated successfully');
        onToken(data.token);
      } else if (data.type === 'recaptcha_error') {
        console.error('❌ [RecaptchaWebView] Error:', data.error);
        if (onError) {
          onError(data.error);
        }
      }
    } catch (error: any) {
      console.error('❌ [RecaptchaWebView] Failed to parse message:', error);
      if (onError) {
        onError('Failed to parse reCAPTCHA response');
      }
    }
  };

  useEffect(() => {
    console.log(`🔵 [RecaptchaWebView] Initializing for action: ${action}`);
    console.log(`🔵 [RecaptchaWebView] Using site key: ${siteKey}`);
    console.log('📝 [RecaptchaWebView] IMPORTANT: Make sure to restart the React Native app if this is the first time adding reCAPTCHA!');
  }, [action, siteKey]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        onLoad={() => {
          console.log('✅ [RecaptchaWebView] WebView loaded successfully');
        }}
        onLoadStart={() => {
          console.log('🔄 [RecaptchaWebView] WebView loading started...');
        }}
        onLoadEnd={() => {
          console.log('🏁 [RecaptchaWebView] WebView loading finished');
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('❌ [RecaptchaWebView] WebView error:', nativeEvent);
          if (onError) {
            onError('WebView failed to load reCAPTCHA script');
          }
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('❌ [RecaptchaWebView] HTTP error:', nativeEvent.statusCode, nativeEvent.url);
          if (onError) {
            onError(`Failed to load reCAPTCHA (HTTP ${nativeEvent.statusCode})`);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  webView: {
    width: 0,
    height: 0,
    opacity: 0,
  },
});

export default RecaptchaWebView;
