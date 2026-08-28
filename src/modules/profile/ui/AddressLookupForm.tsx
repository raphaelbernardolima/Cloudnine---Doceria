import React, { useState, useEffect } from 'react';
import { 
  MapPin, Search, Navigation, Check, AlertCircle, Loader2, 
  Map, Sparkles, Building, Settings, Compass, Info 
} from 'lucide-react';
import { fetchAddressByCep, formatCep, reverseGeocodeLatLng, AddressResult } from '@/src/core/services/addressService';

interface AddressLookupFormProps {
  initialCep?: string;
  initialLogradouro?: string;
  initialNumero?: string;
  initialBairro?: string;
  initialCidade?: string;
  initialUf?: string;
  initialComplemento?: string;
  initialPontoReferencia?: string;
  onAddressChange: (address: AddressResult) => void;
  compact?: boolean;
}

export const AddressLookupForm: React.FC<AddressLookupFormProps> = ({
  initialCep = '',
  initialLogradouro = '',
  initialNumero = '',
  initialBairro = '',
  initialCidade = '',
  initialUf = 'SP',
  initialComplemento = '',
  initialPontoReferencia = '',
  onAddressChange,
  compact = false
}) => {
  const [cep, setCep] = useState(initialCep);
  const [logradouro, setLogradouro] = useState(initialLogradouro);
  const [numero, setNumero] = useState(initialNumero);
  const [bairro, setBairro] = useState(initialBairro);
  const [cidade, setCidade] = useState(initialCidade);
  const [uf, setUf] = useState(initialUf);
  const [complemento, setComplemento] = useState(initialComplemento);
  const [pontoReferencia, setPontoReferencia] = useState(initialPontoReferencia);

  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [googleApiKey, setGoogleApiKey] = useState<string>('');
  const [showGoogleConfig, setShowGoogleConfig] = useState(false);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Sync to parent whenever values change
  useEffect(() => {
    onAddressChange({
      cep,
      logradouro,
      numero,
      bairro,
      cidade,
      uf,
      complemento,
      pontoReferencia,
      lat: geoCoords?.lat,
      lng: geoCoords?.lng,
      formattedAddress: `${logradouro}${numero ? `, ${numero}` : ''} - ${bairro}, ${cidade} - ${uf} (CEP: ${cep})`
    });
  }, [cep, logradouro, numero, bairro, cidade, uf, complemento, pontoReferencia, geoCoords]);

  // Handle CEP Input & Automatic Lookup
  const handleCepInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatCep(rawVal);
    setCep(formatted);
    setErrorMessage(null);

    const clean = rawVal.replace(/\D/g, '');
    if (clean.length === 8) {
      await executeCepLookup(clean);
    }
  };

  const executeCepLookup = async (cepDigits: string) => {
    setLoadingCep(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const data = await fetchAddressByCep(cepDigits);
      setLogradouro(data.logradouro);
      setBairro(data.bairro);
      setCidade(data.cidade);
      setUf(data.uf);
      if (data.complemento && !complemento) setComplemento(data.complemento);
      setSuccessMessage(`CEP ${data.cep} localizado automaticamente!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao buscar CEP. Verifique o número digitado.');
    } finally {
      setLoadingCep(false);
    }
  };

  // Geolocation Lookup via Browser GPS
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Navegador não suporta geolocalização por GPS.');
      return;
    }

    setLoadingGeo(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGeoCoords({ lat, lng });

        try {
          const result = await reverseGeocodeLatLng(lat, lng, googleApiKey);
          if (result.logradouro) setLogradouro(result.logradouro);
          if (result.bairro) setBairro(result.bairro);
          if (result.cidade) setCidade(result.cidade);
          if (result.uf) setUf(result.uf);
          if (result.cep) setCep(result.cep);
          if (result.numero) setNumero(result.numero);

          setSuccessMessage('Localização encontrada! Confira se os dados estão corretos abaixo.');
          setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: any) {
          setErrorMessage(err.message || 'Não foi possível converter o GPS em endereço.');
        } finally {
          setLoadingGeo(false);
        }
      },
      (error) => {
        setLoadingGeo(false);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage('Permissão de localização negada pelo navegador. Você pode selecionar um local de teste abaixo.');
        } else {
          setErrorMessage('Não foi possível obter o sinal do GPS do dispositivo.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Quick preset locations for easy testing in preview
  const handleQuickPresetLocation = async (presetName: string, lat: number, lng: number) => {
    setGeoCoords({ lat, lng });
    setLoadingGeo(true);
    setErrorMessage(null);
    try {
      const result = await reverseGeocodeLatLng(lat, lng, googleApiKey);
      setLogradouro(result.logradouro);
      setBairro(result.bairro);
      setCidade(result.cidade);
      setUf(result.uf);
      setNumero(result.numero || '100');
      setCep(result.cep || '01000-000');
      setSuccessMessage(`Localização preenchida: ${presetName}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e) {
      setErrorMessage('Erro ao carregar pré-definição.');
    } finally {
      setLoadingGeo(false);
    }
  };

  return (
    <div className={`animate-in fade-in duration-200 ${compact ? 'space-y-4' : 'space-y-5'}`}>
      
      {/* SECTION 1: Action Bar - GPS */}
      <div className={compact ? 'space-y-3' : 'p-4 sm:p-5 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 space-y-4 shadow-2xs'}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* GPS Auto Location Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={loadingGeo}
            className="w-full px-4 py-3 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-black text-xs sm:text-sm shadow-xs flex items-center justify-center space-x-2.5 transition-all hover:opacity-90 min-h-[48px] disabled:opacity-60 cursor-pointer"
          >
            {loadingGeo ? (
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            ) : (
              <Navigation className="w-5 h-5 shrink-0" />
            )}
            <span>{loadingGeo ? 'Buscando...' : 'Usar minha localização atual'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {loadingCep && (
        <div className="p-3.5 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-extrabold text-xs flex items-center space-x-2.5 border border-[var(--color-primary)]/30">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Buscando endereço pelo CEP nas bases oficiais da API de CEP...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 font-bold text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center space-x-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SECTION 2: Address Fields Form Grid (Spacious & Modern) */}
      <div className={compact ? 'space-y-4 pt-1' : 'p-4 sm:p-6 rounded-3xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/30 space-y-4 shadow-xs'}>
        <div className="border-b border-[var(--color-outline-variant)]/20 pb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-extrabold text-sm text-[var(--color-on-surface)] flex items-center gap-2">
            <Building className="w-4 h-4 text-[var(--color-primary)]" />
            <span>Dados do Endereço</span>
          </h4>
          {geoCoords && (
            <span className="text-sm font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-500/20">
              <MapPin className="w-3 h-3" /> GPS ({geoCoords.lat.toFixed(4)}, {geoCoords.lng.toFixed(4)})
            </span>
          )}
        </div>

        {/* Row 1: CEP & Logradouro / Rua */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          
          {/* CEP Input */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="font-extrabold text-xs text-[var(--color-on-surface)] flex items-center justify-between">
              <span>CEP <span className="text-rose-500">*</span></span>
              <span className="text-sm text-[var(--color-primary)] font-bold">Busca Automática</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={cep}
                onChange={handleCepInput}
                placeholder="00000-000"
                maxLength={9}
                className="w-full p-3 pr-10 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 font-black text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all min-h-[46px]"
              />
              {loadingCep ? (
                <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)] absolute right-3 top-3" />
              ) : (
                <Search className="w-5 h-5 text-[var(--color-outline)] absolute right-3 top-3" />
              )}
            </div>
            <span className="text-sm text-[var(--color-outline)] block">
              Digite os 8 números do CEP.
            </span>
          </div>

          {/* Rua / Logradouro */}
          <div className="sm:col-span-8 space-y-1.5">
            <label className="font-extrabold text-xs text-[var(--color-on-surface)] block">
              Rua / Logradouro <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={logradouro}
              onChange={(e) => setLogradouro(e.target.value)}
              placeholder="Ex: Av. Paulista, Alameda Santos"
              className="w-full p-3 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 font-extrabold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all min-h-[46px]"
            />
          </div>
        </div>

        {/* Row 2: Número, Bairro, Cidade */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          
          {/* Número */}
          <div className="sm:col-span-3 space-y-1.5">
            <label className="font-extrabold text-xs text-[var(--color-on-surface)] block">
              Número <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="1500, S/N"
              className="w-full p-3 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 font-black text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all min-h-[46px]"
            />
          </div>

          {/* Bairro */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="font-extrabold text-xs text-[var(--color-on-surface)] block">
              Bairro <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Ex: Gonzaga, Boqueirão"
              className="w-full p-3 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 font-extrabold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all min-h-[46px]"
            />
          </div>

          {/* Cidade */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="font-extrabold text-xs text-[var(--color-on-surface)] block">
              Cidade
            </label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex: Santos"
              className="w-full p-3 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 font-extrabold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all min-h-[46px]"
            />
          </div>
        </div>

        {/* Row 3: Complemento & Ponto de Referência */}
        {!compact && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Complemento */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-xs text-[var(--color-on-surface)] block">
                Complemento / Apto / Bloco
              </label>
              <input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Ex: Apto 42, Bloco B, Casa 2"
                className="w-full p-3 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all min-h-[46px]"
              />
            </div>

            {/* Ponto de Referência */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-xs text-[var(--color-on-surface)] block">
                Ponto de Referência
              </label>
              <input
                type="text"
                value={pontoReferencia}
                onChange={(e) => setPontoReferencia(e.target.value)}
                placeholder="Ex: Próximo à estação do metrô, portaria 2"
                className="w-full p-3 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all min-h-[46px]"
              />
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

