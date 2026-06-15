'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateIncident } from '@/domain/incident/hooks';
import { INCIDENT_TYPE_OPTIONS, MAPBOX_DEFAULT_CENTER } from '@/lib/constants';
import type { CreateIncidentDTO, IncidentPriority } from '@/domain/incident/types';
import styles from './CreateIncidentModal.module.scss';

const createIncidentSchema = z.object({
  title: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(200, 'Máximo 200 caracteres'),
  description: z
    .string()
    .min(10, 'Mínimo 10 caracteres')
    .max(2000, 'Máximo 2000 caracteres'),
  dueDate: z.string().optional(),
  typeKey: z.string().min(1, 'Selecciona una categoría'),
  priority: z.enum(['low', 'medium', 'high']),
});

type FormValues = z.infer<typeof createIncidentSchema>;

const PRIORITY_OPTIONS: { value: IncidentPriority; label: string }[] = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
];

function focusTrap(element: HTMLElement, previous: HTMLElement | null) {
  const focusable = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') return;
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }

  element.addEventListener('keydown', handleKeyDown);
  first?.focus();
  return () => element.removeEventListener('keydown', handleKeyDown);
}

type CreateIncidentModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateIncidentModal({ open, onClose }: CreateIncidentModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const createIncident = useCreateIncident();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      typeKey: '',
      priority: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousFocus.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  const onSubmit = useCallback(
    (data: FormValues) => {
      const dto: CreateIncidentDTO = {
        title: data.title,
        description: data.description,
        typeKey: data.typeKey,
        priority: data.priority,
        projectId: '01',
        dueDate: data.dueDate || undefined,
        lat: MAPBOX_DEFAULT_CENTER[1],
        lng: MAPBOX_DEFAULT_CENTER[0],
        locationDescription: '',
      };

      createIncident(dto);
      reset();
      onClose();
    },
    [createIncident, reset, onClose]
  );

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
        <div
          className={styles.modal}
          ref={(el) => {
            if (!el) return;
            return focusTrap(el, previousFocus.current);
          }}
        >
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            Nueva incidencia
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.body}>
            <div className={styles.field}>
              <label htmlFor="title" className={styles.label}>
                Título
              </label>
              <input
                id="title"
                type="text"
                className={styles.input}
                {...register('title')}
                placeholder="Ej: Fisura en losa sector B"
              />
              {errors.title && (
                <p className={styles.error}>{errors.title.message}</p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="description" className={styles.label}>
                Descripción
              </label>
              <textarea
                id="description"
                className={styles.textarea}
                rows={4}
                {...register('description')}
                placeholder="Describe el problema con el mayor detalle posible..."
              />
              {errors.description && (
                <p className={styles.error}>{errors.description.message}</p>
              )}
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="typeKey" className={styles.label}>
                  Categoría
                </label>
                <select id="typeKey" className={styles.select} {...register('typeKey')}>
                  <option value="">Seleccionar</option>
                  {INCIDENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.typeKey && (
                  <p className={styles.error}>{errors.typeKey.message}</p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="priority" className={styles.label}>
                  Prioridad
                </label>
                <select id="priority" className={styles.select} {...register('priority')}>
                  <option value="">Seleccionar</option>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.priority && (
                  <p className={styles.error}>{errors.priority.message}</p>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="dueDate" className={styles.label}>
                  Fecha vencimiento
                </label>
                <input
                  id="dueDate"
                  type="date"
                  className={styles.input}
                  {...register('dueDate')}
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando…' : 'Guardar incidencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
