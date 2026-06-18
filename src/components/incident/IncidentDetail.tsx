'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Users,
  Eye,
  Tag,
  FolderOpen,
  FileText,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  PauseCircle,
} from 'lucide-react';
import { useIncidents, useLoadIncidents, useIsLoading, useUpdateIncident } from '@/domain/incident/hooks';
import { INCIDENT_STATUS_LABELS, INCIDENT_PRIORITY_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/formatDate';
import type { Incident, UpdateIncidentDTO, IncidentStatus, IncidentPriority } from '@/domain/incident/types';
import styles from './IncidentDetail.module.scss';

type IncidentDetailProps = { id: string };

const editSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  description: z.string().min(10, 'Mínimo 10 caracteres').max(2000, 'Máximo 2000 caracteres'),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['open', 'on_pause', 'closed']),
  dueDate: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

const STATUS_OPTIONS: { value: IncidentStatus; label: string; icon: typeof AlertCircle }[] = [
  { value: 'open', label: 'Abierta', icon: AlertCircle },
  { value: 'on_pause', label: 'En pausa', icon: PauseCircle },
  { value: 'closed', label: 'Cerrada', icon: CheckCircle2 },
];

const PRIORITY_OPTIONS: { value: IncidentPriority; label: string; icon: typeof AlertTriangle }[] = [
  { value: 'low', label: 'Baja', icon: AlertTriangle },
  { value: 'medium', label: 'Media', icon: AlertTriangle },
  { value: 'high', label: 'Alta', icon: AlertTriangle },
];

function Timeline({ incident }: { incident: Incident }) {
  const events = [
    { label: 'Creada', date: incident.createdAt, icon: FileText },
    { label: 'Actualizada', date: incident.updatedAt, icon: Edit3 },
    ...(incident.closingDate ? [{ label: 'Cerrada', date: incident.closingDate, icon: CheckCircle2 }] : []),
  ];

  return (
    <div className={styles.timeline}>
      {events.map((ev, i) => {
        const Icon = ev.icon;
        const isLast = i === events.length - 1;
        return (
          <div key={ev.label} className={styles.timelineItem}>
            <div className={styles.timelineLine}>
              <div className={styles.timelineDot}>
                <Icon size={12} />
              </div>
              {!isLast && <div className={styles.timelineBar} />}
            </div>
            <div className={styles.timelineContent}>
              <span className={styles.timelineLabel}>{ev.label}</span>
              <span className={styles.timelineDate}>{formatDate(ev.date)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PeopleList({ people, empty, icon: Icon }: { people: { id: string; name: string; email: string; avatarUrl: string }[]; empty: string; icon: typeof User }) {
  if (people.length === 0) return <span className={styles.empty}>{empty}</span>;
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
          <span className={styles.notFoundIcon}>
            <AlertCircle size={40} />
          </span>
          <h2 className={styles.notFoundTitle}>Incidencia no encontrada</h2>
          <p className={styles.notFoundText}>La incidencia que buscas no existe o ha sido eliminada.</p>
          <Link href="/dashboard" className={styles.backLink}>Volver al dashboard</Link>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_OPTIONS.find((s) => s.value === incident.status)?.icon ?? AlertCircle;
  const PriorityIcon = PRIORITY_OPTIONS.find((p) => p.value === incident.priority)?.icon ?? AlertTriangle;

  return (
    <div className={styles.page}>
      <Link href="/dashboard" className={styles.back}>
        <ArrowLeft size={16} />
        Volver a incidencias
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.header}>
          <div className={styles.headerTitleRow}>
            {isEditing ? (
              <div className={styles.editField}>
                <input
                  {...register('title')}
                  className={styles.editInputTitle}
                  placeholder="Título de la incidencia"
                  aria-label="Título"
                />
                {errors.title && <p className={styles.editError}>{errors.title.message}</p>}
              </div>
            ) : (
              <h1 className={styles.title}>{incident.title}</h1>
            )}
            <span className={styles.sequenceId}>{incident.sequenceId}</span>
          </div>

          <div className={styles.headerActions}>
            {isEditing ? (
              <>
                <button type="button" onClick={handleCancel} className={styles.btnSecondary}>
                  <X size={14} />
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className={styles.btnPrimary}>
                  <Save size={14} />
                  {isSubmitting ? 'Guardando…' : 'Guardar'}
                </button>
              </>
            ) : (
              <button type="button" onClick={handleStartEdit} className={styles.btnPrimary}>
                <Edit3 size={14} />
                Editar
              </button>
            )}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.main}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <FileText size={16} />
                <h2 className={styles.cardTitle}>Descripción</h2>
              </div>
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
              <div className={styles.cardHeader}>
                <MapPin size={16} />
                <h2 className={styles.cardTitle}>Ubicación</h2>
              </div>
              <p className={styles.locationText}>
                {incident.locationDescription || 'Sin ubicación registrada'}
              </p>
              {incident.coordinates && (
                <p className={styles.coords}>
                  {incident.coordinates.lat.toFixed(5)}, {incident.coordinates.lng.toFixed(5)}
                </p>
              )}
            </section>
            {incident.tags.length > 0 && (
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <Tag size={16} />
                  <h2 className={styles.cardTitle}>Etiquetas</h2>
                </div>
                <div className={styles.tags}>
                  {incident.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className={styles.tag}
                      style={{ background: `${tag.color}14`, color: tag.color, borderColor: `${tag.color}40` }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <FolderOpen size={16} />
                <h2 className={styles.cardTitle}>Archivos adjuntos</h2>
              </div>
              <MediaGallery media={incident.media} />
            </section>
          </div>

          <aside className={styles.sidebar}>
            <section className={styles.card}>
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  {isEditing ? (
                    <div className={styles.editField}>
                      <label className={styles.metaLabel}>Estado</label>
                      <select {...register('status')} className={styles.editSelect} aria-label="Estado">
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <span className={styles.metaLabel}>Estado</span>
                      <span className={`${styles.badge} ${styles[`badge--${incident.status}`]}`}>
                        <StatusIcon size={12} />
                        {INCIDENT_STATUS_LABELS[incident.status]}
                      </span>
                    </>
                  )}
                </div>

                <div className={styles.metaItem}>
                  {isEditing ? (
                    <div className={styles.editField}>
                      <label className={styles.metaLabel}>Prioridad</label>
                      <select {...register('priority')} className={styles.editSelect} aria-label="Prioridad">
                        {PRIORITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <span className={styles.metaLabel}>Prioridad</span>
                      <span className={`${styles.badge} ${styles[`badge--${incident.priority}`]}`}>
                        <PriorityIcon size={12} />
                        {INCIDENT_PRIORITY_LABELS[incident.priority]}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.metaRow}>
                <Calendar size={14} />
                <span className={styles.metaLabel}>Vence</span>
                {isEditing ? (
                  <div className={styles.editField}>
                    <input type="date" {...register('dueDate')} className={styles.editInput} aria-label="Fecha de vencimiento" />
                    {errors.dueDate && <p className={styles.editError}>{errors.dueDate.message}</p>}
                  </div>
                ) : (
                  <span className={styles.metaValue}>{incident.dueDate ? formatDate(incident.dueDate) : '—'}</span>
                )}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <User size={16} />
                <h2 className={styles.cardTitle}>Responsable</h2>
              </div>
              <PeopleList people={incident.owner ? [incident.owner] : []} empty="Sin responsable" icon={User} />
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Users size={16} />
                <h2 className={styles.cardTitle}>Asignados</h2>
              </div>
              <PeopleList people={incident.assignees} empty="Sin asignados" icon={Users} />
            </section>

            {incident.observers.length > 0 && (
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <Eye size={16} />
                  <h2 className={styles.cardTitle}>Observadores</h2>
                </div>
                <PeopleList people={incident.observers} empty="Sin observadores" icon={Eye} />
              </section>
            )}

            <section className={styles.card}>
              <div className={styles.metaRow}>
                <FolderOpen size={14} />
                <span className={styles.metaLabel}>Proyecto</span>
                <span className={styles.metaValue}>{incident.project.name}</span>
              </div>
              <div className={styles.metaRow}>
                <Tag size={14} />
                <span className={styles.metaLabel}>Categoría</span>
                <span className={styles.metaValue}>{incident.type.name}</span>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <Clock size={16} />
                <h2 className={styles.cardTitle}>Línea de tiempo</h2>
              </div>
              <Timeline incident={incident} />
            </section>
          </aside>
        </div>
      </form>
    </div>
  );
}
