'use client';

import { useEffect, useState } from 'react';
import { callBulkUpsertGateway } from '@/lib/gateway';
import { getSupabaseBrowserClientSingleton } from '@/lib/supabase/browser-singleton';

import CandidateActionButton from '@/components/candidate/ui/CandidateActionButton';
import CandidateCallout from '@/components/candidate/ui/CandidateCallout';

interface Field {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  dependsOn?: string;
  dependsOnValue?: string;
}

interface CandidateOnboardingSectionFormProps {
  session: any;
  fields: Field[];
  title: string;
}

function CandidateField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: any;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}) {
  const baseInputClassName =
    'mt-3 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-950/40';

  let inputElement: React.ReactNode;

  switch (field.type) {
    case 'textarea':
      inputElement = (
        <textarea
          rows={4}
          name={field.name}
          id={field.name}
          value={value || ''}
          onChange={onChange}
          className={baseInputClassName}
          required={field.required}
        />
      );
      break;
    case 'select':
      inputElement = (
        <select
          name={field.name}
          id={field.name}
          value={value || ''}
          onChange={onChange}
          className={baseInputClassName}
          required={field.required}
        >
          <option value="">Please select</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
      break;
    default:
      inputElement = (
        <input
          type={field.type}
          name={field.name}
          id={field.name}
          value={value || ''}
          onChange={onChange}
          className={baseInputClassName}
          required={field.required}
        />
      );
  }

  return (
    <div
      className={`rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60 ${
        field.type === 'textarea' ? 'md:col-span-2' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <label htmlFor={field.name} className="text-sm font-bold text-slate-900 dark:text-white">
          {field.label}
        </label>
        {field.required ? (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            Required
          </span>
        ) : (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Optional
          </span>
        )}
      </div>
      {inputElement}
    </div>
  );
}

export default function CandidateOnboardingSectionForm({
  session,
  fields,
  title,
}: CandidateOnboardingSectionFormProps) {
  const [baseRecord, setBaseRecord] = useState<{ [key: string]: any } | null>(null);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchAndSetUserData = async () => {
      if (!session?.user?.id) return;

      const supabase = getSupabaseBrowserClientSingleton();
      const { data, error } = await supabase
        .from('emp_primary_master')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        setMessage({ type: 'error', text: 'Could not load existing data.' });
        return;
      }

      setBaseRecord(data);

      const initialSectionData: { [key: string]: any } = {};
      fields.forEach((field) => {
        initialSectionData[field.name] = data?.[field.name] ?? '';
      });
      setFormData(initialSectionData);
    };

    void fetchAndSetUserData();
  }, [fields, session?.user?.id]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const processedData = { ...formData };

      fields.forEach((field) => {
        if (!field.required && processedData[field.name] === '') {
          processedData[field.name] = null;
        }
      });

      const completePayload = { ...baseRecord, ...processedData };
      const payload = {
        config_id: 'ebcda741-8118-4ec0-8180-d6cbc73153d0',
        input_rows: [
          {
            ...completePayload,
            user_id: session.user.id,
          },
        ],
      };

      const result = await callBulkUpsertGateway(
        'ebcda741-8118-4ec0-8180-d6cbc73153d0',
        { input_rows: payload.input_rows },
        session.access_token,
      );

      if (!result.success) {
        throw new Error(result.error || result.message || 'Failed to save data');
      }

      setBaseRecord(completePayload);
      setMessage({ type: 'success', text: `${title} saved successfully.` });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Something went wrong while saving this section.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleFields = fields.filter((field) => {
    if (!field.dependsOn) return true;
    return formData[field.dependsOn] === field.dependsOnValue;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {visibleFields.map((field) => (
          <CandidateField
            key={field.name}
            field={field}
            value={formData[field.name]}
            onChange={handleChange}
          />
        ))}
      </div>

      {message ? (
        <CandidateCallout
          tone={message.type === 'success' ? 'success' : 'error'}
          title={message.type === 'success' ? 'Section saved' : 'Could not save section'}
          message={message.text}
        />
      ) : null}

      <div className="mt-2 flex flex-wrap justify-end gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/60">
        <CandidateActionButton type="submit" isLoading={isSubmitting}>
          {isSubmitting ? 'Saving...' : `Save ${title}`}
        </CandidateActionButton>
      </div>
    </form>
  );
}

