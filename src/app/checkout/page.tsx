'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Barcode, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

type PaymentMethod = 'credit_card' | 'pix' | 'boleto';
type PaymentStatus = 'idle' | 'processing' | 'paid' | 'failed' | 'expired';

const CHECKOUT_STORAGE_KEY = 'fluxo-checkout-state';

const formatCep = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const formatCvv = (value: string) => value.replace(/\D/g, '').slice(0, 4);

type BuyerInfo = {
  name: string;
  email: string;
  postalCode: string;
  phone: string;
  address: string;
  city: string;
  state: string;
};

type CardInfo = {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
  installments: string;
};

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorReason, setErrorReason] = useState('');
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    postalCode: user?.postalCode ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    city: user?.city ?? '',
    state: user?.state ?? '',
  });
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    number: '',
    holder: user?.name ?? '',
    expiry: '',
    cvv: '',
    installments: '1',
  });
  const router = useRouter();
  const finalStatusHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          buyerInfo: BuyerInfo;
          cardInfo: CardInfo;
          step: number;
          paymentMethod: PaymentMethod;
          status: PaymentStatus;
        };

        setBuyerInfo((prev) => ({ ...prev, ...parsed.buyerInfo }));
        setCardInfo((prev) => ({ ...prev, ...parsed.cardInfo }));
        setStep(parsed.step ?? 1);
        setPaymentMethod(parsed.paymentMethod ?? 'credit_card');
        setStatus(parsed.status ?? 'idle');
      } catch (error) {
        console.warn('CheckoutPage: estado salvo inválido, limpando storage', error);
        window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      }
    } else if (user) {
      setBuyerInfo((prev) => ({
        ...prev,
        name: user.name ?? prev.name,
        email: user.email ?? prev.email,
        postalCode: user.postalCode ?? prev.postalCode,
        phone: user.phone ?? prev.phone,
        address: user.address ?? prev.address,
        city: user.city ?? prev.city,
        state: user.state ?? prev.state,
      }));
      setCardInfo((prev) => ({
        ...prev,
        holder: user.name ?? prev.holder,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (status === 'paid') {
      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      return;
    }

    const payload = {
      buyerInfo,
      cardInfo,
      step,
      paymentMethod,
      status,
    };

    window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(payload));
  }, [buyerInfo, cardInfo, step, paymentMethod, status]);

  useEffect(() => {
    if (!['paid', 'failed', 'expired'].includes(status)) {
      return;
    }

    if (typeof window === 'undefined') return;

    window.requestAnimationFrame(() => {
      finalStatusHeadingRef.current?.focus({ preventScroll: true });
    });
  }, [status]);

  const handleBuyerChange = (field: keyof BuyerInfo) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const rawValue = event.target.value;
    let formattedValue = rawValue;

    if (field === 'postalCode') {
      formattedValue = formatCep(rawValue);
    } else if (field === 'phone') {
      formattedValue = formatPhone(rawValue);
    }

    if (formattedValue !== rawValue && event.currentTarget instanceof HTMLInputElement) {
      event.currentTarget.value = formattedValue;
    }

    setBuyerInfo((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  const handleCardChange = (field: keyof CardInfo) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const rawValue = event.target.value;
    let formattedValue = rawValue;

    if (field === 'number') {
      formattedValue = formatCardNumber(rawValue);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(rawValue);
    } else if (field === 'cvv') {
      formattedValue = formatCvv(rawValue);
    }

    if (formattedValue !== rawValue && event.currentTarget instanceof HTMLInputElement) {
      event.currentTarget.value = formattedValue;
    }

    setCardInfo((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  const resetPaymentState = () => {
    setStatus('idle');
    setStatusMessage('');
    setErrorReason('');
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        CHECKOUT_STORAGE_KEY,
        JSON.stringify({
          buyerInfo,
          cardInfo,
          step,
          paymentMethod,
          status: 'idle' as PaymentStatus,
        })
      );
    }
  };

  const focusField = (fieldId: string) => {
    if (typeof window === 'undefined') return;
    window.requestAnimationFrame(() => {
      const element = document.getElementById(fieldId) as HTMLElement | null;
      element?.focus({ preventScroll: true });
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const notifyValidationError = (message: string, fieldId?: string) => {
    toast({
      title: 'Dados incompletos',
      description: message,
      variant: 'destructive',
    });

    if (fieldId) {
      focusField(fieldId);
    }
  };

  const validateBuyerInfo = () => {
    const validations: { value: string; id: string; message: string; pattern?: RegExp }[] = [
      { value: buyerInfo.name, id: 'name', message: 'Informe seu nome completo.' },
      { value: buyerInfo.email, id: 'email', message: 'Informe um e-mail válido.', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      { value: buyerInfo.postalCode, id: 'cep', message: 'Informe o CEP no formato 00000-000.', pattern: /^\d{5}-\d{3}$/ },
      { value: buyerInfo.phone, id: 'phone', message: 'Informe o telefone no formato (00) 00000-0000.', pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/ },
      { value: buyerInfo.address, id: 'address', message: 'Informe o endereço completo.' },
      { value: buyerInfo.city, id: 'city', message: 'Informe a cidade.' },
      { value: buyerInfo.state, id: 'state', message: 'Selecione o estado.' },
    ];

    for (const field of validations) {
      const trimmedValue = field.value?.trim() ?? '';
      if (!trimmedValue) {
        notifyValidationError(field.message, field.id);
        return false;
      }

      if (field.pattern && !field.pattern.test(trimmedValue)) {
        notifyValidationError(field.message, field.id);
        return false;
      }
    }

    return true;
  };

  const validateCardInfo = () => {
    if (paymentMethod !== 'credit_card') {
      return true;
    }

    const cleanedNumber = cardInfo.number.replace(/\s+/g, '');
    if (cleanedNumber.length < 13) {
      notifyValidationError('Informe um número de cartão válido.', 'cardNumber');
      return false;
    }

    if (!cardInfo.holder.trim()) {
      notifyValidationError('Informe o nome do titular do cartão.', 'cardName');
      return false;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardInfo.expiry.trim())) {
      notifyValidationError('Informe a validade no formato MM/AA.', 'cardExpiry');
      return false;
    }

    if (!/^\d{3,4}$/.test(cardInfo.cvv.trim())) {
      notifyValidationError('Informe o CVV com 3 ou 4 dígitos.', 'cardCvv');
      return false;
    }

    return true;
  };

  const simulatePayment = async () => {
    setStatus('processing');
    setStatusMessage('Processando pagamento...');
    setErrorReason('');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const random = Math.random();
    let outcome: PaymentStatus = 'paid';
    if (paymentMethod === 'credit_card') {
      outcome = random > 0.75 ? 'failed' : 'paid';
    } else if (paymentMethod === 'pix') {
      if (random < 0.1) outcome = 'failed';
      else if (random < 0.3) outcome = 'expired';
    } else if (paymentMethod === 'boleto') {
      if (random < 0.4) outcome = 'expired';
      else if (random < 0.6) outcome = 'failed';
    }

    if (outcome === 'paid') {
      setStatus('paid');
      setStatusMessage('Pagamento aprovado!');
      clearCart();
      toast({
        title: 'Pagamento aprovado',
        description: 'Seu pedido foi confirmado com sucesso.',
        variant: 'success',
      });
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      }
      return;
    }

    if (outcome === 'failed') {
      setStatus('failed');
      setErrorReason('Não foi possível processar o pagamento. Verifique os dados e tente novamente.');
      toast({
        title: 'Pagamento não autorizado',
        description: 'Verifique os dados do pagamento e tente novamente.',
        variant: 'destructive',
      });
      return;
    }

    setStatus('expired');
    setErrorReason(paymentMethod === 'pix'
      ? 'O QR Code expirou antes da confirmação. Gere um novo para tentar novamente.'
      : 'O boleto expirou. É necessário gerar um novo para concluir o pedido.');
    toast({
      title: paymentMethod === 'pix' ? 'Pix expirado' : 'Boleto expirado',
      description: 'Gere um novo pagamento para concluir seu pedido.',
      variant: 'destructive',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'idle') {
      return;
    }

    if (step === 1) {
      if (!validateBuyerInfo()) {
        return;
      }
      setStep(2);
      toast({
        title: 'Dados confirmados',
        description: 'Revise e selecione seu método de pagamento.',
      });
      return;
    }

    if (step === 2) {
      if (!validateBuyerInfo()) {
        setStep(1);
        return;
      }
      if (!validateCardInfo()) {
        return;
      }
      setStep(3);
      toast({
        title: 'Forma de pagamento pronta',
        description: 'Revise o pedido antes de confirmar.',
      });
      return;
    }

    if (step === 3) {
      if (!validateBuyerInfo()) {
        setStep(1);
        return;
      }
      if (!validateCardInfo()) {
        setStep(2);
        return;
      }
      await simulatePayment();
    }
  };

  if (items.length === 0 && status !== 'paid') {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground">Adicione itens ao carrinho para continuar</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a loja
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'paid') {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="max-w-md mx-auto bg-green-50 text-green-700 p-6 rounded-lg">
          <div className="text-5xl mb-4">🎉</div>
          <h1
            ref={finalStatusHeadingRef}
            tabIndex={-1}
            className="text-2xl font-bold mb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
          >
            Compra realizada com sucesso!
          </h1>
          <p className="mb-6">Seu pedido foi processado e em breve você receberá um e-mail com os detalhes.</p>
          <div className="bg-white p-4 rounded-md text-left mb-6 text-gray-700">
            <p className="font-medium">Método de pagamento:</p>
            <p className="capitalize">{paymentMethod.replace('_', ' ')}</p>
            {paymentMethod === 'pix' && (
              <p className="mt-2 text-sm">O QR Code foi confirmado e seu pagamento está aprovado.</p>
            )}
            {paymentMethod === 'boleto' && (
              <p className="mt-2 text-sm">O boleto foi confirmado. Aguarde a confirmação por e-mail.</p>
            )}
          </div>
          <Button onClick={() => router.push('/products')}>
            Voltar para a loja
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'failed' || status === 'expired') {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="max-w-md mx-auto bg-destructive/10 text-destructive p-6 rounded-lg">
          <div className="text-5xl mb-4">⚠️</div>
          <h1
            ref={finalStatusHeadingRef}
            tabIndex={-1}
            className="text-2xl font-bold mb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
          >
            {status === 'failed' ? 'Pagamento não autorizado' : 'Pagamento expirado'}
          </h1>
          <p className="mb-6 text-destructive-foreground">{errorReason}</p>
          <div className="flex flex-col gap-3">
            <Button variant="default" onClick={() => {
              resetPaymentState();
              setStep(paymentMethod === 'credit_card' ? 2 : 3);
            }}>
              Tentar novamente
            </Button>
            <Button variant="outline" onClick={() => {
              resetPaymentState();
              setStep(2);
            }}>
              Escolher outro método
            </Button>
            <Button variant="ghost" onClick={() => router.push('/cart')}>
              Voltar ao carrinho
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => step === 1 ? router.push('/cart') : setStep(1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="flex flex-col gap-3 mb-8 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Finalizar Compra</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {[1, 2, 3].map((currentStep) => (
              <div key={currentStep} className={`flex items-center gap-2 ${step === currentStep ? 'text-primary font-medium' : ''}`}>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${step === currentStep ? 'border-primary bg-primary text-white' : 'border-muted'}`}>
                  {currentStep}
                </div>
                <span className="hidden sm:inline">
                  {currentStep === 1 ? 'Dados' : currentStep === 2 ? 'Pagamento' : 'Revisão'}
                </span>
                {currentStep < 3 && <div className="hidden sm:block w-10 h-px bg-muted" />}
              </div>
            ))}
          </div>
        </div>

        {status === 'processing' && (
          <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <div>
                <p className="font-medium text-primary">Processando pagamento...</p>
                <p className="text-muted-foreground">{statusMessage || 'Isso pode levar alguns segundos.'}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-4">Informações de Entrega</h2>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="name">
                        Nome completo
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Seu nome completo"
                        value={buyerInfo.name}
                        onChange={handleBuyerChange('name')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="email">
                        E-mail
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="seu@email.com"
                        value={buyerInfo.email}
                        onChange={handleBuyerChange('email')}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="cep">
                          CEP
                        </label>
                        <input
                          id="cep"
                          type="text"
                          required
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="00000-000"
                          value={buyerInfo.postalCode}
                          onChange={handleBuyerChange('postalCode')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="phone">
                          Telefone
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          required
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="(00) 00000-0000"
                          value={buyerInfo.phone}
                          onChange={handleBuyerChange('phone')}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="address">
                        Endereço
                      </label>
                      <input
                        id="address"
                        type="text"
                        required
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Rua, número, complemento"
                        value={buyerInfo.address}
                        onChange={handleBuyerChange('address')}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1" htmlFor="city">
                          Cidade
                        </label>
                        <input
                          id="city"
                          type="text"
                          required
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="Sua cidade"
                          value={buyerInfo.city}
                          onChange={handleBuyerChange('city')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="state">
                          Estado
                        </label>
                        <select
                          id="state"
                          required
                          className="w-full px-3 py-2 border rounded-md bg-white text-black"
                          value={buyerInfo.state}
                          onChange={handleBuyerChange('state')}
                        >
                          <option value="">UF</option>
                          <option value="AC">AC</option>
                          <option value="AL">AL</option>
                          <option value="AP">AP</option>
                          <option value="AM">AM</option>
                          <option value="BA">BA</option>
                          <option value="CE">CE</option>
                          <option value="DF">DF</option>
                          <option value="ES">ES</option>
                          <option value="GO">GO</option>
                          <option value="MA">MA</option>
                          <option value="MT">MT</option>
                          <option value="MS">MS</option>
                          <option value="MG">MG</option>
                          <option value="PA">PA</option>
                          <option value="PB">PB</option>
                          <option value="PR">PR</option>
                          <option value="PE">PE</option>
                          <option value="PI">PI</option>
                          <option value="RJ">RJ</option>
                          <option value="RN">RN</option>
                          <option value="RS">RS</option>
                          <option value="RO">RO</option>
                          <option value="RR">RR</option>
                          <option value="SC">SC</option>
                          <option value="SP">SP</option>
                          <option value="SE">SE</option>
                          <option value="TO">TO</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Método de Pagamento</h2>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`w-full text-left p-4 border rounded-lg transition-colors ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${paymentMethod === 'credit_card' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Cartão de Crédito</h3>
                        <p className="text-sm text-muted-foreground">Pague com cartão de crédito</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`w-full text-left p-4 border rounded-lg transition-colors ${paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${paymentMethod === 'pix' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                        <QrCode className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Pix</h3>
                        <p className="text-sm text-muted-foreground">Pague com Pix e tenha 5% de desconto</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('boleto')}
                    className={`w-full text-left p-4 border rounded-lg transition-colors ${paymentMethod === 'boleto' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${paymentMethod === 'boleto' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                        <Barcode className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Boleto Bancário</h3>
                        <p className="text-sm text-muted-foreground">Pague com boleto bancário</p>
                      </div>
                    </div>
                  </button>

                  {paymentMethod === 'credit_card' && (
                    <div className="mt-6 space-y-4 p-4 bg-muted/30 rounded-lg">
                      <div className="grid gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="cardNumber">
                            Número do Cartão
                          </label>
                          <input
                            id="cardNumber"
                            type="text"
                            required
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="0000 0000 0000 0000"
                            value={cardInfo.number}
                            onChange={handleCardChange('number')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="cardName">
                            Nome do Titular
                          </label>
                          <input
                            id="cardName"
                            type="text"
                            required
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Nome como está no cartão"
                            value={cardInfo.holder}
                            onChange={handleCardChange('holder')}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="cardExpiry">
                              Validade
                            </label>
                            <input
                              id="cardExpiry"
                              type="text"
                              required
                              className="w-full px-3 py-2 border rounded-md"
                              placeholder="MM/AA"
                              value={cardInfo.expiry}
                              onChange={handleCardChange('expiry')}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="cardCvv">
                              CVV
                            </label>
                            <input
                              id="cardCvv"
                              type="text"
                              required
                              className="w-full px-3 py-2 border rounded-md"
                              placeholder="000"
                              value={cardInfo.cvv}
                              onChange={handleCardChange('cvv')}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="installments">
                              Parcelas
                            </label>
                            <select
                              id="installments"
                              className="w-full px-3 py-2 border rounded-md bg-white text-black"
                              value={cardInfo.installments}
                              onChange={handleCardChange('installments')}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                                <option key={num} value={num}>
                                  {num}x de R$ {(subtotal / num).toFixed(2)} {num > 1 ? '(sem juros)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="border rounded-lg p-6 space-y-6">
                <h2 className="text-lg font-semibold">Revisão do Pedido</h2>
                <div className="space-y-2">
                  <h3 className="font-medium">Dados do comprador</h3>
                  <p className="text-sm text-muted-foreground">{buyerInfo.name}</p>
                  <p className="text-sm text-muted-foreground">{buyerInfo.email}</p>
                  <p className="text-sm text-muted-foreground">{buyerInfo.phone}</p>
                  <p className="text-sm text-muted-foreground">{buyerInfo.address}, {buyerInfo.city} - {buyerInfo.state}, {buyerInfo.postalCode}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Pagamento</h3>
                  <p className="capitalize text-sm text-muted-foreground">{paymentMethod.replace('_', ' ')}</p>
                  {paymentMethod === 'credit_card' && (
                    <p className="text-sm text-muted-foreground">
                      Cartão terminado em {cardInfo.number.slice(-4)} - {cardInfo.installments}x
                    </p>
                  )}
                  {paymentMethod === 'pix' && (
                    <p className="text-sm text-muted-foreground">Pix com QR Code válido por 10 minutos.</p>
                  )}
                  {paymentMethod === 'boleto' && (
                    <p className="text-sm text-muted-foreground">Boleto com vencimento em 3 dias úteis.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="border rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity}x R$ {item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <p>R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} itens)</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {paymentMethod === 'pix' && (
                  <div className="flex justify-between">
                    <span>Desconto (5%)</span>
                    <span className="text-green-600">- R$ {(subtotal * 0.05).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>Grátis</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    R$ {paymentMethod === 'pix' 
                      ? (subtotal * 0.95).toFixed(2)
                      : subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6"
                size="lg"
                disabled={status === 'processing'}
              >
                {status === 'processing' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </span>
                ) : step === 1 ? (
                  'Continuar para o pagamento'
                ) : step === 2 ? (
                  'Revisar pedido'
                ) : (
                  `Pagar com ${paymentMethod === 'credit_card' ? 'Cartão' : paymentMethod === 'pix' ? 'Pix' : 'Boleto'}`
                )}
              </Button>

              <p className="text-xs text-muted-foreground mt-2 text-center">
                Seus dados estão protegidos com criptografia de ponta.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
