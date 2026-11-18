import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/colors';
import { Spacing, Radius, Elevation } from '../src/constants/theme';
import { Typography } from '../src/constants/typography';
import { Icon, IconName } from '../src/components/Icon';
import { GlassView } from '../src/components/GlassView';
import { PressableScale } from '../src/components/PressableScale';
import { useProfile } from '../src/state/ProfileContext';
import { FREE_DAILY_SWIPES } from '../src/lib/monetization';

const PRO_BENEFITS: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'infinite', title: 'Recomendações ilimitadas', desc: 'Sem limite diário de swipes.' },
  { icon: 'star', title: 'Destaque no feed', desc: 'Seu perfil aparece mais para os outros.' },
  { icon: 'briefcase', title: 'Acesso a vagas pagas', desc: 'Veja e candidate-se a gigs remuneradas.' },
  { icon: 'ribbon', title: 'Selo Pro no perfil', desc: 'Mais credibilidade nas conexões.' },
];

export default function UpgradeScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const [processing, setProcessing] = useState(false);

  const isPro = profile.plan === 'pro';

  const subscribe = () => {
    // NOTA: o pagamento real (gateway/assinatura) é uma integração externa
    // pendente. Aqui apenas marcamos o plano para habilitar os benefícios.
    Alert.alert(
      'Assinar o Pro',
      'O pagamento ainda não está integrado nesta versão. Deseja ativar o Pro em modo demonstração?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ativar demo',
          onPress: () => {
            setProcessing(true);
            updateProfile({ plan: 'pro' });
            setTimeout(() => {
              setProcessing(false);
              router.back();
            }, 400);
          },
        },
      ]
    );
  };

  const downgrade = () => {
    updateProfile({ plan: 'free' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Fechar">
          <GlassView intensity={60} radius={Radius.pill} style={styles.headerBtn}>
            <Icon name="close" size={18} color={Colors.textPrimary} />
          </GlassView>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoHalo}>
          <Icon name="musical-notes" size={40} color={Colors.accent} />
        </View>
        <Text style={styles.title}>SoundMatch Pro</Text>
        <Text style={styles.subtitle}>
          {isPro
            ? 'Você é Pro. Aproveite todos os benefícios.'
            : `No plano gratuito você tem ${FREE_DAILY_SWIPES} swipes por dia.`}
        </Text>

        <View style={styles.benefits}>
          {PRO_BENEFITS.map((b) => (
            <View key={b.title} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Icon name={b.icon} size={20} color={Colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.price}>R$ 19,90</Text>
          <Text style={styles.pricePeriod}>por mês</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isPro ? (
          <PressableScale style={styles.manageBtn} onPress={downgrade}>
            <Text style={styles.manageText}>Voltar ao plano gratuito</Text>
          </PressableScale>
        ) : (
          <PressableScale
            style={[styles.subscribeBtn, processing && styles.subscribeBtnDisabled]}
            onPress={subscribe}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color={Colors.base} />
            ) : (
              <Text style={styles.subscribeText}>Assinar o Pro</Text>
            )}
          </PressableScale>
        )}
        <Text style={styles.disclaimer}>
          Pagamento não integrado nesta versão (demonstração).
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  header: { flexDirection: 'row', justifyContent: 'flex-end', padding: Spacing.md },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { padding: Spacing.xl, alignItems: 'center' },
  logoHalo: {
    width: 84,
    height: 84,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: { ...Typography.h1 },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxl,
  },

  benefits: { alignSelf: 'stretch', gap: Spacing.lg, marginBottom: Spacing.xxl },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md + 2 },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: { ...Typography.h3, fontSize: 16 },
  benefitDesc: { ...Typography.caption, marginTop: 1 },

  priceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xxl + Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
    ...Elevation.sm,
  },
  price: { ...Typography.display, fontSize: 32, lineHeight: 36, color: Colors.accent },
  pricePeriod: { ...Typography.caption, marginTop: 2 },

  footer: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm + 2,
  },
  subscribeBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  subscribeBtnDisabled: { backgroundColor: Colors.surface },
  subscribeText: { ...Typography.button, fontSize: 16 },
  manageBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  manageText: { ...Typography.bodyStrong, fontSize: 15 },
  disclaimer: { color: Colors.textMuted, fontSize: 12, textAlign: 'center' },
});
