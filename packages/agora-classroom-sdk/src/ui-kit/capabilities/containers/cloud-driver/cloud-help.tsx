import { SvgIconEnum, SvgImg, transI18n } from '~ui-kit';
import { FileTypeSvgColor } from '@/infra/stores/common/cloud-drive';

const cloudHelpTips: {
      svgType: SvgIconEnum;
      desc: string;
      supportType: string[];
}[] = [
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
                                    <div className={'text-level1'} style={{ fontSize: 13 }}>
                                          {item.desc}
                                    </div>
                                    <div className={'text-level1'} style={{ fontSize: 12 }}>
                                          {transI18n('cloud.fileType')}: {item.supportType.join(' ')}
                                    </div>
                              </div>
                        </div>
                  ))}
            </div>
      );
}
