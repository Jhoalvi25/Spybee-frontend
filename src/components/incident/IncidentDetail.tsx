'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useIncidents, useLoadIncidents, useIsLoading, useUpdateIncident } from '@/domain/incident/hooks';
import { INCIDENT_STATUS_LABELS, INCIDENT_PRIORITY_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { Incident, UpdateIncidentDTO, IncidentStatus, IncidentPriority } from '@/domain/incident/types';
import styles from './IncidentDetail.module.scss';

type IncidentDetailProps = {
  id: string;
};

const editSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  description: z.string().min(10, 'Mínimo 10 caracteres').max(2000, 'Máximo 2000 caracteres'),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['open', 'on_pause', 'closed']),
  dueDate: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

const STATUS_OPTIONS: { value: IncidentStatus; label: string }[] = [
  { value: 'open', label: 'Abierta' },
  { value: 'on_pause', label: 'En pausa' },
  { value: 'closed', label: 'Cerrada' },
];

const PRIORITY_OPTIONS: { value: IncidentPriority; label: string }[] = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{children}</span>
    </div>
  );
}

function PeopleList({ people, empty }: { people: { id: string; name: string; email: string; avatarUrl: string }[]; empty: string }) {
  if (people.length === 0) {
    return <span className={styles.empty}>{empty}</span>;
  }
  return (
    <div className={styles.people}>
      {people.map((p) => (
        <div key={p.id} className={styles.person}>
          <img src={p.avatarUrl} alt="" className={styles.avatar} />
          <div className={styles.personInfo}>
            <span className={styles.personName}>{p.name}</span>
            <span className={styles.personEmail}>{p.email}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MediaGallery({ media }: { media: Incident['media'] }) {
  const images = media.filter((m) => m.type === 'image');
  const videos = media.filter((m) => m.type === 'video');

  if (media.length === 0) return <span className={styles.empty}>Sin archivos adjuntos</span>;

  return (
    <div className={styles.gallery}>
      {images.map((m) => (
        <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className={styles.mediaItem}>
          <img src={m.url} alt={m.name} className={styles.mediaImg} loading="lazy" />
          <span className={styles.mediaStatus}>{m.status === 'pending' ? 'Pendiente' : 'Aprobado'}</span>
        </a>
      ))}
      {videos.map((m) => (
        <div key={m.id} className={styles.mediaItem}>
          <video src={m.url} controls className={styles.mediaVideo} />
          <span className={styles.mediaStatus}>{m.status === 'pending' ? 'Pendiente' : 'Aprobado'}</span>
        </div>
      ))}
    </div>
  );
}

export function IncidentDetail({ id }: IncidentDetailProps) {
  const incidents = useIncidents();
  const loadIncidents = useLoadIncidents();
  const isLoading = useIsLoading();
  const updateIncident = useUpdateIncident();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (incidents.length === 0) loadIncidents();
  }, [loadIncidents, incidents.length]);

  const incident = useMemo(() => incidents.find((i) => i.id === id) ?? null, [incidents, id]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    values: incident ? {
      title: incident.title,
      description: incident.description,
      priority: incident.priority,
      status: incident.status,
      dueDate: incident.dueDate ? incident.dueDate.split('T')[0] : '',
    } : undefined,
  });

  const onSubmit = useCallback((data: EditFormValues) => {
    if (!incident) return;
    const dto: UpdateIncidentDTO = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate || null,
    };
    updateIncident(incident.id, dto);
    setIsEditing(false);
  }, [incident, updateIncident]);

  const handleCancel = useCallback(() => {
    reset();
    setIsEditing(false);
  }, [reset]);

  const handleStartEdit = useCallback(() => setIsEditing(true), []);

  if (isLoading && !incident) {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton}>Cargando incidencia…</div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <span className={styles.notFoundIcon}>🔍</span>
          <h2 className={styles.notFoundTitle}>Incidencia no encontrada</h2>
          <p className={styles.notFoundText}>La incidencia que buscas no existe o ha sido eliminada.</p>
          <Link href="/dashboard" className={styles.backLink}>Volver al dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link href="/dashboard" className={styles.back}>{'← Volver'}</Link>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            {isEditing ? (
              <div className={styles.editTitleWrap}>
                <input
                  {...register('title')}
                  className={`${styles.editInput} ${styles.editInputTitle}`}
                  placeholder="Título de la incidencia"
                  aria-label="Título"
                />
                {errors.title && <p className={styles.editError}>{errors.title.message}</p>}
              </div>
            ) : (
              <>
                <h1 className={styles.title}>{incident.title}</h1>
                <span className={styles.sequenceId}>{incident.sequenceId}</span>
              </>
            )}
          </div>

          <div className={styles.headerRow}>
            <div className={styles.badges}>
              {isEditing ? (
                <>
                  <select {...register('priority')} className={styles.editBadge} aria-label="Prioridad">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <select {...register('status')} className={styles.editBadge} aria-label="Estado">
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <span className={`${styles.badge} ${styles[`badge--${incident.priority}`]}`}>
                    {INCIDENT_PRIORITY_LABELS[incident.priority]}
                  </span>
                  <span className={`${styles.badge} ${styles[`badge--${incident.status}`]}`}>
                    {INCIDENT_STATUS_LABELS[incident.status]}
                  </span>
                </>
              )}
            </div>

            <div className={styles.actions}>
              {isEditing ? (
                <>
                  <button type="button" onClick={handleCancel} className={styles.btnSecondary}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSubmitting} className={styles.btnPrimary}>
                    {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </>
              ) : (
                <button type="button" onClick={handleStartEdit} className={styles.btnOutline}>
                  Editar
                </button>
              )}
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.main}>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Descripción</h2>
              {isEditing ? (
                <div>
                  <textarea
                    {...register('description')}
                    className={styles.editTextarea}
                    rows={6}
                    placeholder="Describe el problema…"
                    aria-label="Descripción"
                  />
                  {errors.description && <p className={styles.editError}>{errors.description.message}</p>}
                </div>
              ) : (
                <p className={styles.description}>{incident.description}</p>
              )}
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Archivos adjuntos</h2>
              <MediaGallery media={incident.media} />
            </section>
          </div>

          <aside className={styles.sidebar}>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Detalles</h2>
              <Field label="Proyecto">{incident.project.name}</Field>
              <Field label="Categoría">{incident.type.name}</Field>
              <Field label="Ubicación">{incident.locationDescription || '—'}</Field>
              {incident.coordinates && (
                <Field label="Coordenadas">
                  {incident.coordinates.lat.toFixed(4)}, {incident.coordinates.lng.toFixed(4)}
                </Field>
              )}
              <Field label="Creada">{formatDate(incident.createdAt)}</Field>
              <Field label="Vence">
                {isEditing ? (
                  <div>
                    <input type="date" {...register('dueDate')} className={styles.editInput} aria-label="Fecha de vencimiento" />
                    {errors.dueDate && <p className={styles.editError}>{errors.dueDate.message}</p>}
                  </div>
                ) : (
                  incident.dueDate ? formatDate(incident.dueDate) : '—'
                )}
              </Field>
              {incident.closingDate && <Field label="Cerrada">{formatDate(incident.closingDate)}</Field>}
              <Field label="Aprobación">{incident.approval ? 'Aprobada' : 'Pendiente'}</Field>
            </section>

            {incident.owner && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Responsable</h2>
                <PeopleList people={[incident.owner]} empty="Sin responsable" />
              </section>
            )}

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Asignados</h2>
              <PeopleList people={incident.assignees} empty="Sin asignados" />
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Observadores</h2>
              <PeopleList people={incident.observers} empty="Sin observadores" />
            </section>

            {incident.tags.length > 0 && (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>Etiquetas</h2>
                <div className={styles.tags}>
                  {incident.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className={styles.tag}
                      style={{ background: `${tag.color}1A`, color: tag.color, borderColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </form>
    </div>
  );
}
