import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import { FileTypeSvgColor } from '@classroom/infra/stores/common/cloud-drive';
import { transI18n } from 'agora-common-libs';
import { useMemo } from 'react';

export default function CloudHelp() {
  const cloudHelpTips = useMemo(() => {
    return [
      {
        svgType: SvgIconEnum.PPT,
        desc: transI18n('cloud.ppt'),
        supportType: ['ppt', 'pptx'],
      },
      {
        svgType: SvgIconEnum.WORD,
        desc: transI18n('cloud.word'),
        supportType: ['docx', 'doc'],
      },
      {
        svgType: SvgIconEnum.PDF,
        desc: transI18n('cloud.pdf'),
        supportType: ['pdf'],
      },
      {
        svgType: SvgIconEnum.VIDEO,
        desc: transI18n('cloud.video'),
        supportType: ['mp4'],
      },
      {
        svgType: SvgIconEnum.AUDIO,
        desc: transI18n('cloud.audio'),
        supportType: ['mp3'],
      },
      {
        svgType: SvgIconEnum.ALF,
        desc: transI18n('fcr_online_courseware_label_file_type'),
        supportType: ['alf'],
      },
      {
        svgType: SvgIconEnum.IMAGE,
        desc: transI18n('cloud.photo'),
        supportType: ['png', 'jpg'],
      },
    ];
  }, []);

  return (
    <div className="cloud-help">
      <div className="cloud-help-title" style={{ marginBottom: 14 }}>
        {transI18n('cloud.supprotTypeTitle')}
      </div>
      {cloudHelpTips.map((item, index) => (
        <div className="cloud-help-tip" key={index}>
          <div className="help-tip-left">
            <SvgImg
              type={item.svgType}
              style={{ color: FileTypeSvgColor[item.svgType as keyof typeof FileTypeSvgColor] }}
            />
          </div>
          <div className="help-tip-right">
            <div className={'fcr-text-level1'} style={{ fontSize: 13 }}>
              {item.desc}
            </div>
            <div className={'fcr-text-level1'} style={{ fontSize: 12 }}>
              {transI18n('cloud.fileType')}: {item.supportType.join(' ')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
