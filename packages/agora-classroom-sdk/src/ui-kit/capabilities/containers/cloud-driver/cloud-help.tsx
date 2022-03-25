import React from 'react';
import { SvgImg, transI18n } from '~ui-kit';
import { FileTypeSvgColor } from '@/infra/stores/common/cloud-ui';

const cloudHelpTips: {
  svgType: string;
  desc: string;
  supportType: string[];
}[] = [
  {
    svgType: 'ppt',
    desc: transI18n('cloud.ppt'),
    supportType: ['ppt', 'pptx'],
  },
  {
    svgType: 'word',
    desc: transI18n('cloud.word'),
    supportType: ['docx', 'doc'],
  },
  {
    svgType: 'excel',
    desc: transI18n('cloud.excel'),
    supportType: ['xlsx', 'xls', 'csv'],
  },
  {
    svgType: 'pdf',
    desc: transI18n('cloud.pdf'),
    supportType: ['pdf'],
  },
  {
    svgType: 'video',
    desc: transI18n('cloud.video'),
    supportType: ['mp4'],
  },
  {
    svgType: 'audio',
    desc: transI18n('cloud.audio'),
    supportType: ['mp3'],
  },
  {
    svgType: 'txt',
    desc: transI18n('cloud.txt'),
    supportType: ['txt'],
  },
  {
    svgType: 'image',
    desc: transI18n('cloud.photo'),
    supportType: ['png', 'jpg', 'gif'],
  },
];

export default function CloudHelp() {
  return (
    <div className="cloud-help">
      <div className="cloud-help-title" style={{ marginBottom: 14 }}>
        {transI18n('cloud.supprotTypeTitle')}
      </div>
      {cloudHelpTips.map((item, index) => (
        <div className="cloud-help-tip" key={index}>
          <div className="help-tip-left">
            <SvgImg type={item.svgType} style={{ color: FileTypeSvgColor[item.svgType] }} />
          </div>
          <div className="help-tip-right">
            <div style={{ color: '#191919', fontSize: 13 }}>{item.desc}</div>
            <div style={{ color: '#586376', fontSize: 12 }}>
              {transI18n('cloud.fileType')}: {item.supportType.join(' ')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
