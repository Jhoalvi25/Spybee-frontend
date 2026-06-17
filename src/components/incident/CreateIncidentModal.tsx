'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bug } from 'lucide-react';
import { useCreateIncident } from '@/domain/incident/hooks';
import { MiniMapPicker } from '@/components/ui/MiniMapPicker';
import {
  PROJECT_OPTIONS,
  INCIDENT_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  PEOPLE_OPTIONS,
  TAG_OPTIONS,
  MAPBOX_DEFAULT_CENTER,
} from '@/lib/constants';
import type { CreateIncidentDTO } from '@/domain/incident/types';
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
  projectId: z.string().min(1, 'Selecciona un proyecto'),
  typeKey: z.string().min(1, 'Selecciona una categoría'),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['open', 'on_pause', 'closed']),
  dueDate: z.string().optional(),
  ownerId: z.string().optional(),
  assigneeIds: z.array(z.string()),
  observerIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  locationDescription: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  mediaUrls: z.string().optional(),
});

type FormValues = z.infer<typeof createIncidentSchema>;

function focusTrapCleanup(element: HTMLElement, previous: HTMLElement | null): () => void {
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
  const cleanupTrap = useRef<(() => void) | null>(null);
  const createIncident = useCreateIncident();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: '01',
      typeKey: '',
      priority: undefined,
      status: 'open',
      dueDate: '',
      ownerId: '',
      assigneeIds: [],
      observerIds: [],
      tagIds: [],
      locationDescription: '',
      lat: MAPBOX_DEFAULT_CENTER[0],
      lng: MAPBOX_DEFAULT_CENTER[1],
      mediaUrls: '',
    },
  });

  const lat = watch('lat');
  const lng = watch('lng');
  const descLength = (watch('description') ?? '').length;

  // Modal open/close side effects
  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousFocus.current?.focus();
      previousFocus.current = null;
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Focus trap — stored in ref so it runs after the DOM paints
  const modalRef = useCallback(
    (el: HTMLDivElement | null) => {
      // Cleanup previous trap
      if (cleanupTrap.current) {
        cleanupTrap.current();
        cleanupTrap.current = null;
      }
      if (!el || !open) return;
      cleanupTrap.current = focusTrapCleanup(el, previousFocus.current);
    },
    [open]
  );

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

  const handleMapChange = useCallback(
    (newLat: number, newLng: number) => {
      setValue('lat', newLat, { shouldValidate: false });
      setValue('lng', newLng, { shouldValidate: false });
    },
    [setValue]
  );

  const onSubmit = useCallback(
    (data: FormValues) => {
      const dto: CreateIncidentDTO = {
        title: data.title,
        description: data.description,
        typeKey: data.typeKey,
        priority: data.priority,
        projectId: data.projectId,
        status: data.status,
        ownerId: data.ownerId || undefined,
        assigneeIds: data.assigneeIds,
        observerIds: data.observerIds,
        tagIds: data.tagIds,
        lat: data.lat,
        lng: data.lng,
        locationDescription: data.locationDescription ?? '',
        dueDate: data.dueDate || undefined,
        media: data.mediaUrls
          ? data.mediaUrls
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .map((url) => ({ name: url.split('/').pop() ?? url, url }))
          : undefined,
      };

      createIncident(dto);
      reset();
      onClose();
    },
    [createIncident, reset, onClose]
  );

  const handleCancel = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

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
      <div ref={modalRef} className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>
              <Bug size={20} />
            </span>
            <div>
              <h2 id="modal-title" className={styles.title}>
                Nueva incidencia
              </h2>
              <p className={styles.headerSub}>Registrar un nuevo hallazgo dentro del proyecto</p>
            </div>
          </div>
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
            {/* ── Información General ── */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h3 className={styles.sectionTitle}>Información General</h3>
                <p className={styles.sectionDesc}>Describe el problema detectado en la obra.</p>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.field}>
                  <label htmlFor="title" className={styles.label}>
                    Título <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                    {...register('title')}
                    placeholder="Ej: Fisura en losa sector B"
                  />
                  {errors.title && <p className={styles.error}>{errors.title.message}</p>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="description" className={styles.label}>
                    Descripción <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="description"
                    className={`${styles.textarea} ${errors.description ? styles.textareaError : ''}`}
                    rows={5}
                    {...register('description')}
                    placeholder="Describe la incidencia encontrada, riesgos, afectaciones y contexto..."
                  />
                  <div className={styles.charCount}>
                    <span className={descLength > 2000 ? styles.charOver : ''}>{descLength}</span>
                    <span>/2000</span>
                  </div>
                  {errors.description && <p className={styles.error}>{errors.description.message}</p>}
                </div>
              </div>
            </section>

            {/* ── Clasificación ── */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h3 className={styles.sectionTitle}>Clasificación</h3>
                <p className={styles.sectionDesc}>Categoriza la incidencia para su gestión.</p>
              </div>
              <div className={`${styles.sectionBody} ${styles.sectionGrid2}`}>
                <div className={styles.field}>
                  <label htmlFor="projectId" className={styles.label}>
                    Proyecto <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.selectWrap}>
                    <select id="projectId" className={`${styles.select} ${errors.projectId ? styles.selectError : ''}`} {...register('projectId')}>
                      {PROJECT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {errors.projectId && <p className={styles.error}>{errors.projectId.message}</p>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="typeKey" className={styles.label}>
                    Categoría <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.selectWrap}>
                    <select id="typeKey" className={`${styles.select} ${errors.typeKey ? styles.selectError : ''}`} {...register('typeKey')}>
                      <option value="">Seleccionar</option>
                      {INCIDENT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {errors.typeKey && <p className={styles.error}>{errors.typeKey.message}</p>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="priority" className={styles.label}>
                    Prioridad <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.selectWrap}>
                    <select id="priority" className={`${styles.select} ${errors.priority ? styles.selectError : ''}`} {...register('priority')}>
                      <option value="">Seleccionar</option>
                      {PRIORITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {errors.priority && <p className={styles.error}>{errors.priority.message}</p>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="status" className={styles.label}>Estado</label>
                  <div className={styles.selectWrap}>
                    <select id="status" className={styles.select} {...register('status')}>
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Planificación ── */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h3 className={styles.sectionTitle}>Planificación</h3>
                <p className={styles.sectionDesc}>Establece plazos y etiquetas de seguimiento.</p>
              </div>
              <div className={`${styles.sectionBody} ${styles.sectionGrid2}`}>
                <div className={styles.field}>
                  <label htmlFor="dueDate" className={styles.label}>
                    Fecha límite
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    className={styles.input}
                    {...register('dueDate')}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Etiquetas</label>
                  <div className={styles.tagGrid}>
                    {TAG_OPTIONS.map((t) => (
                      <label
                        key={t.id}
                        className={styles.tagCheckbox}
                        style={{ '--tag-color': t.color } as React.CSSProperties}
                      >
                        <input
                          type="checkbox"
                          value={t.id}
                          {...register('tagIds')}
                        />
                        <span>{t.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Ubicación ── */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h3 className={styles.sectionTitle}>Ubicación</h3>
                <p className={styles.sectionDesc}>Señala el punto exacto en el mapa.</p>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.field}>
                  <MiniMapPicker lat={lat} lng={lng} onChange={handleMapChange} />
                </div>

                <div className={styles.coordRow}>
                  <div className={styles.field}>
                    <label htmlFor="lat" className={styles.labelSm}>Latitud</label>
                    <input
                      id="lat"
                      type="number"
                      step="any"
                      className={styles.input}
                      value={lat}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) handleMapChange(v, lng);
                      }}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="lng" className={styles.labelSm}>Longitud</label>
                    <input
                      id="lng"
                      type="number"
                      step="any"
                      className={styles.input}
                      value={lng}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v)) handleMapChange(lat, v);
                      }}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="locationDescription" className={styles.labelSm}>
                      Referencia
                    </label>
                    <input
                      id="locationDescription"
                      type="text"
                      className={styles.input}
                      {...register('locationDescription')}
                      placeholder="Ej: Piso 5, sector norte"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Responsable y equipo ── */}
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h3 className={styles.sectionTitle}>Equipo</h3>
                <p className={styles.sectionDesc}>Asigna responsables y participantes.</p>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.sectionGrid2}>
                  <div className={styles.field}>
                    <label htmlFor="ownerId" className={styles.label}>Responsable</label>
                    <div className={styles.selectWrap}>
                      <select id="ownerId" className={styles.select} {...register('ownerId')}>
                        <option value="">Sin responsable</option>
                        {PEOPLE_OPTIONS.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Archivos adjuntos</label>
                    <input
                      id="mediaUrls"
                      type="text"
                      className={styles.input}
                      {...register('mediaUrls')}
                      placeholder="URLs separadas por coma"
                    />
                    <p className={styles.hint}>Ingresa URLs de imágenes para simular la carga de archivos</p>
                  </div>
                </div>

                <div className={styles.peopleGrid}>
                  <fieldset className={styles.fieldset}>
                    <legend className={styles.label}>Asignados</legend>
                    <div className={styles.checkboxGrid}>
                      {PEOPLE_OPTIONS.map((p) => (
                        <label key={p.id} className={styles.checkbox}>
                          <input
                            type="checkbox"
                            value={p.id}
                            {...register('assigneeIds')}
                          />
                          <span>{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className={styles.fieldset}>
                    <legend className={styles.label}>Observadores</legend>
                    <div className={styles.checkboxGrid}>
                      {PEOPLE_OPTIONS.map((p) => (
                        <label key={p.id} className={styles.checkbox}>
                          <input
                            type="checkbox"
                            value={p.id}
                            {...register('observerIds')}
                          />
                          <span>{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>
            </section>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleCancel}
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
