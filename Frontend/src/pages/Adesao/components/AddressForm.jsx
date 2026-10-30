import { useState } from 'react';
import { User, Mail, Phone, MapPin, Home, Hash, Building2, MapPinned, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

const INITIAL_FORM = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  zip_code: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
};

const FIELDS = [
  { name: 'customer_name', label: 'Nome Completo', placeholder: 'Ex: Maria Silva', icon: User, type: 'text', span: 2, section: 'customer' },
  { name: 'customer_email', label: 'E-mail', placeholder: 'seu@email.com', icon: Mail, type: 'email', span: 1, section: 'customer' },
  { name: 'customer_phone', label: 'Telefone / WhatsApp', placeholder: '(11) 99999-9999', icon: Phone, type: 'tel', span: 1, section: 'customer' },
  { name: 'zip_code', label: 'CEP', placeholder: '00000-000', icon: MapPin, type: 'text', span: 1, section: 'address' },
  { name: 'street', label: 'Logradouro', placeholder: 'Rua, avenida...', icon: Home, type: 'text', span: 1, section: 'address' },
  { name: 'number', label: 'Número', placeholder: '123', icon: Hash, type: 'text', span: 1, section: 'address' },
  { name: 'complement', label: 'Complemento (opcional)', placeholder: 'Apto, bloco, casa...', icon: Building2, type: 'text', span: 1, section: 'address', optional: true },
  { name: 'neighborhood', label: 'Bairro', placeholder: 'Centro', icon: MapPinned, type: 'text', span: 1, section: 'address' },
  { name: 'city', label: 'Cidade', placeholder: 'São Paulo', icon: Building2, type: 'text', span: 1, section: 'address' },
  { name: 'state', label: 'UF', placeholder: 'SP', icon: MapPin, type: 'text', span: 1, section: 'address', maxLength: 2 },
];

function validate(form) {
  const errors = {};

  if (form.customer_name.trim().length < 2) errors.customer_name = 'Informe o nome completo.';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email.trim())) {
    errors.customer_email = 'Informe um e-mail válido.';
  }

  if (form.customer_phone.replace(/\D/g, '').length < 8) {
    errors.customer_phone = 'Informe um telefone válido com DDD.';
  }

  if (form.zip_code.replace(/\D/g, '').length !== 8) {
    errors.zip_code = 'Informe um CEP válido com 8 dígitos.';
  }

  if (form.street.trim().length < 2) errors.street = 'Informe o logradouro.';
  if (!form.number.trim()) errors.number = 'Informe o número.';
  if (form.neighborhood.trim().length < 2) errors.neighborhood = 'Informe o bairro.';
  if (form.city.trim().length < 2) errors.city = 'Informe a cidade.';

  if (!/^[A-Za-z]{2}$/.test(form.state.trim())) {
    errors.state = 'Informe a UF com 2 letras (ex: SP).';
  }

  return errors;
}

export default function AddressForm({ onSubmit, submitting, serverError, hasItems }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    await onSubmit({
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim(),
      customer_phone: form.customer_phone.trim(),
      address: {
        zip_code: form.zip_code.trim(),
        street: form.street.trim(),
        number: form.number.trim(),
        complement: form.complement.trim() || null,
        neighborhood: form.neighborhood.trim(),
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
      },
    });
  };

  const renderField = (field) => {
    const Icon = field.icon;
    const hasError = Boolean(errors[field.name]);

    return (
      <div key={field.name} className={field.span === 2 ? 'sm:col-span-2' : ''}>
        <label htmlFor={field.name} className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
          {field.label}
        </label>
        <div className="relative">
          <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${hasError ? 'text-red-400' : 'text-slate-500'}`} />
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            value={form[field.name]}
            onChange={handleChange}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className={`w-full bg-slate-800/60 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:ring-2 ${
              hasError
                ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
          />
        </div>
        {hasError && (
          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {errors[field.name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">

      {/* Dados do Cliente */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-1">Dados do Cliente</h3>
        <p className="text-slate-500 text-sm mb-5">Informações para contato e acompanhamento do pedido.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {FIELDS.filter((field) => field.section === 'customer').map(renderField)}
        </div>
      </div>

      {/* Endereço de Instalação */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-1">Endereço de Entrega e Instalação</h3>
        <p className="text-slate-500 text-sm mb-5">Local onde os equipamentos serão entregues e instalados pela equipe técnica.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {FIELDS.filter((field) => field.section === 'address').map(renderField)}
        </div>
      </div>

      {/* Erro retornado pela API */}
      {serverError && (
        <div className="mb-6 flex items-start gap-2.5 bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3.5 text-sm text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !hasItems}
        className="w-full flex items-center justify-center gap-2.5 px-7 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:shadow-none cursor-pointer text-sm"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Enviando pedido...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            <span>{hasItems ? 'Confirmar Adesão' : 'Selecione dispositivos para continuar'}</span>
          </>
        )}
      </button>
    </form>
  );
}
