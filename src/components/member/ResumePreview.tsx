import React from 'react';
import { Star } from 'lucide-react';

type TemplateType = 'modern' | 'classic' | 'minimal';

interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  rating: number;
  experience: number;
  bio: string;
  skills: Array<{ name: string; level: string }>;
  companies: Array<{
    companyName: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  projects: Array<{
    title: string;
    description: string;
    skillsRequired: string[];
  }>;
  achievements: Array<{ title: string }>;
}

interface Props {
  data: ResumeData;
  template: TemplateType;
  isPrintMode?: boolean;
}

export default function ResumePreview({ data, template, isPrintMode = false }: Props) {
  const baseStyles = isPrintMode ? {} : {
    backgroundColor: 'white',
    maxWidth: '210mm',
    minHeight: '297mm',
    padding: '20mm',
    margin: '0 auto',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  };

  const getTemplateStyles = () => {
    switch (template) {
      case 'classic':
        return {
          fontFamily: 'Georgia, serif',
          color: '#1f2937',
        };
      case 'minimal':
        return {
          fontFamily: 'Arial, sans-serif',
          color: '#374151',
        };
      default: // modern
        return {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#111827',
        };
    }
  };

  const templateStyles = getTemplateStyles();

  const renderHeader = () => {
    if (template === 'classic') {
      return (
        <div style={{ textAlign: 'center', borderBottom: '3px double #374151', paddingBottom: '20px', marginBottom: '25px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#111827' }}>{data.name}</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 12px 0', letterSpacing: '2px' }}>{data.title.toUpperCase()}</p>
          <div style={{ fontSize: '12px', color: '#4B5563' }}>
            {data.email} • {data.phone} • Rating: {data.rating} <Star size="12" style={{ display: 'inline', fill: '#FBBF24' }} />
          </div>
        </div>
      );
    }

    if (template === 'minimal') {
      return (
        <div style={{ marginBottom: '25px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '300', margin: '0 0 5px 0', color: '#111827' }}>{data.name}</h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 15px 0' }}>{data.title}</p>
          <div style={{ fontSize: '11px', color: '#6B7280', borderTop: '1px solid #E5E7EB', paddingTop: '10px' }}>
            {data.email} | {data.phone} | {data.experience} years experience
          </div>
        </div>
      );
    }

    // Modern
    return (
      <div style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', color: 'white', padding: '30px', margin: '-20mm -20mm 25px -20mm', borderRadius: '0' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{data.name}</h1>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 15px 0' }}>{data.title}</p>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          {data.email} • {data.phone} • Rating: {data.rating} <Star size="12" style={{ display: 'inline', fill: '#FBBF24' }} />
        </div>
      </div>
    );
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <div style={{ marginBottom: '25px' }}>
      <h2 style={{
        fontSize: template === 'classic' ? '16px' : '14px',
        fontWeight: 'bold',
        color: template === 'modern' ? '#3B82F6' : '#111827',
        borderBottom: template === 'minimal' ? '2px solid #374151' : '1px solid #E5E7EB',
        paddingBottom: '8px',
        marginBottom: '15px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        {title}
      </h2>
      {children}
    </div>
  );

  return (
    <div id="resume-preview" style={baseStyles}>
      <div style={templateStyles}>
        {renderHeader()}

        {renderSection('Professional Summary', (
          <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#4B5563', textAlign: 'justify' }}>
            {data.bio}
          </p>
        ))}

        {data.companies.length > 0 && renderSection('Work Experience', (
          <div>
            {data.companies.map((company, idx) => {
              const start = new Date(company.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              const end = company.endDate ? new Date(company.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';
              return (
                <div key={idx} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0', color: '#111827' }}>{company.position}</h3>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>{start} – {end}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: template === 'modern' ? '#3B82F6' : '#4B5563', fontWeight: '600', margin: '2px 0' }}>{company.companyName}</div>
                  <p style={{ fontSize: '11px', color: '#4B5563', lineHeight: '1.5', margin: '5px 0 0 0' }}>{company.description}</p>
                </div>
              );
            })}
          </div>
        ))}

        {data.skills.length > 0 && renderSection('Skills', (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {data.skills.map((skill, idx) => (
              <span key={idx} style={{
                display: 'inline-block',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: '600',
                borderRadius: '4px',
                background: template === 'modern' ? '#EFF6FF' : '#F3F4F6',
                color: template === 'modern' ? '#1D4ED8' : '#374151'
              }}>
                {skill.name}
              </span>
            ))}
          </div>
        ))}

        {data.projects.length > 0 && renderSection('Key Projects', (
          <div>
            {data.projects.map((project, idx) => (
              <div key={idx} style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#111827' }}>{project.title}</h4>
                <p style={{ fontSize: '11px', color: '#4B5563', lineHeight: '1.4', margin: '0 0 5px 0' }}>{project.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                  {project.skillsRequired.slice(0, 4).map((skill, sIdx) => (
                    <span key={sIdx} style={{ fontSize: '9px', padding: '1px 6px', background: '#F3F4F6', color: '#6B7280', borderRadius: '3px' }}>{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        {data.achievements.length > 0 && renderSection('Achievements', (
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            {data.achievements.map((achievement, idx) => (
              <li key={idx} style={{ fontSize: '11px', color: '#4B5563', marginBottom: '5px' }}>
                ★ {achievement.title}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
