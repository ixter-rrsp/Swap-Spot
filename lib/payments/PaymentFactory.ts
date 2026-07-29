import { PaymentProvider } from "./PaymentProvider";
import { PayMongoProvider } from "./PayMongoProvider";

export class PaymentFactory {
  private static instanceMap: Map<string, PaymentProvider> = new Map();

  static getProvider(
    providerName?: string
  ): PaymentProvider {
    const activeProvider = (
      providerName ||
      process.env.PAYMENT_PROVIDER ||
      "paymongo"
    ).toLowerCase();

    if (this.instanceMap.has(activeProvider)) {
      return this.instanceMap.get(activeProvider)!;
    }

    let provider: PaymentProvider;
    switch (activeProvider) {
      case "paymongo":
        provider = new PayMongoProvider();
        break;
      default:
        throw new Error(
          `Unsupported payment provider: '${activeProvider}'. Supported providers: 'paymongo'.`
        );
    }

    this.instanceMap.set(activeProvider, provider);
    return provider;
  }
}
