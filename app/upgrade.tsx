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
import { useProfile } from '../src/state/ProfileContext';
import { FREE_DAILY_SWIPES } from '../src/lib/monetization';

const PRO_BENEFITS = [
  { icon: '♾️', title: 'Recomendações ilimitadas', desc: 'Sem limite diário de swipes.' },
  { icon: '⭐', title: 'Destaque no feed', desc: 'Seu perfil aparece mais para os outros.' },
  { icon: '💼', title: 'Acesso a vagas pagas', desc: 'Veja e candidate-se a gigs remuneradas.' },
  { icon: '🏅', title: 'Selo Pro no perfil', desc: 'Mais credibilidade nas conexões.' },
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
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>🎸</Text>
        <Text style={styles.title}>SoundMatch Pro</Text>
        <Text style={styles.subtitle}>
          {isPro
            ? 'Você é Pro. Aproveite todos os benefícios.'
            : `No plano gratuito você tem ${FREE_DAILY_SWIPES} swipes por dia.`}
        </Text>

        <View style={styles.benefits}>
          {PRO_BENEFITS.map((b) => (
            <View key={b.title} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{b.icon}</Text>
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
          <TouchableOpacity style={styles.manageBtn} onPress={downgrade}>
            <Text style={styles.manageText}>Voltar ao plano gratuito</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.subscribeBtn, processing && styles.subscribeBtnDisabled]}
            onPress={subscribe}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color={Colors.bg} />
            ) : (
              <Text style={styles.subscribeText}>Assinar o Pro</Text>
            )}
          </TouchableOpacity>
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
    backgroundColor: Colors.bg,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  header: { flexDirection: 'row', justifyContent: 'flex-end', padding: 12 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { fontSize: 18, color: Colors.textPrimary },

  content: { padding: 24, alignItems: 'center' },
  logo: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },

  benefits: { alignSelf: 'stretch', gap: 16, marginBottom: 28 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  benefitIcon: { fontSize: 28, width: 36, textAlign: 'center' },
  benefitTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  benefitDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 1 },

  priceCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  price: { fontSize: 32, fontWeight: '900', color: Colors.teal },
  pricePeriod: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  footer: {
    padding: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  subscribeBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribeBtnDisabled: { backgroundColor: Colors.bgCard },
  subscribeText: { color: Colors.bg, fontSize: 16, fontWeight: '800' },
  manageBtn: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  manageText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  disclaimer: { color: Colors.textMuted, fontSize: 12, textAlign: 'center' },
});
