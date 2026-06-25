import { useStore } from '../store/DataStore';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { SectionVisibility } from '../types';

interface Props {
  visKey: keyof SectionVisibility;
  label: string;
}

export function VisibilityBanner({ visKey, label }: Props) {
  const { productSlug } = useParams<{ productSlug: string }>();
  const { data, set } = useStore();
  const visible = data.sectionVisibility?.[visKey] ?? true;

  async function toggle() {
    const next = { ...data.sectionVisibility, [visKey]: !visible };
    set('sectionVisibility', next);
    // Immediately sync visibility to the published row so exec view updates live
    if (productSlug) {
      const pubId = `${productSlug}_pub`;
      const { data: existing } = await supabase
        .from('portal_state').select('data').eq('id', pubId).maybeSingle();
      if (existing?.data) {
        await supabase.from('portal_state').update({
          data: { ...existing.data, sectionVisibility: next },
        }).eq('id', pubId);
      }
    }
  }

  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-2.5 border-b text-xs ${
      visible
        ? 'bg-green-50 border-green-200'
        : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${visible ? 'bg-green-500' : 'bg-amber-400'}`} />
        <span className={visible ? 'text-green-800' : 'text-amber-800'}>
          <span className="font-semibold">{label}</span>
          {' '}is{' '}
          <span className="font-semibold">{visible ? 'visible' : 'hidden'}</span>
          {' '}in the executive view
          {productSlug ? ` for ${productSlug.toUpperCase()}` : ''}.
        </span>
      </div>
      <button
        onClick={toggle}
        className={`flex items-center gap-2 shrink-0 px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
          visible
            ? 'bg-white border-green-300 text-green-700 hover:bg-green-100'
            : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-100'
        }`}
      >
        <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${visible ? 'bg-green-500' : 'bg-gray-300'}`}>
          <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${visible ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
        </span>
        {visible ? 'Hide from exec view' : 'Show in exec view'}
      </button>
    </div>
  );
}
