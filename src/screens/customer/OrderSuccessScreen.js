import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrderSuccessModal from '../../components/orders/OrderSuccessModal';
import { CUSTOMER_ROUTES } from '../../constants/routes';
import { UI_COLORS } from '../../constants/ui';
import { useAccountData } from '../../context/AccountDataContext';

function OrderSuccessScreen({ navigation, route }) {
  const { getOrderById } = useAccountData();
  const routeOrder = route.params?.order || null;
  const fallbackOrderId = route.params?.orderId || '';
  const order = routeOrder || getOrderById(fallbackOrderId);
  const orderId = order?.id || fallbackOrderId;

  function handleTrackOrder() {
    if (!orderId) {
      navigation.reset({
        index: 1,
        routes: [
          { name: CUSTOMER_ROUTES.ACCOUNT },
          { name: CUSTOMER_ROUTES.ACCOUNT_ORDERS },
        ],
      });
      return;
    }

    navigation.reset({
      index: 2,
      routes: [
        { name: CUSTOMER_ROUTES.ACCOUNT },
        { name: CUSTOMER_ROUTES.ACCOUNT_ORDERS },
        {
          name: CUSTOMER_ROUTES.ORDER_DETAIL,
          params: { orderId },
        },
      ],
    });
  }

  function handleBackToHome() {
    navigation.reset({
      index: 0,
      routes: [{ name: CUSTOMER_ROUTES.HOME }],
    });
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <OrderSuccessModal
          onBackToHome={handleBackToHome}
          onTrackOrder={handleTrackOrder}
          order={order}
          presentation="screen"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI_COLORS.screenLight,
  },
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.screenLight,
  },
});

export default OrderSuccessScreen;
