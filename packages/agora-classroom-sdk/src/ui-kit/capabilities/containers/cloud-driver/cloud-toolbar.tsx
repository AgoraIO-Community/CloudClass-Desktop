import { Search, SvgIconEnum, SvgImg, transI18n } from '~ui-kit';

export type CloudToolbarProps = {
  /**
   * 文件数量
   */
  fileCounts: number;
  /**
   * 搜索关键字
   */
  keyword: string;
  /**
   * 关键字搜索变化
   */
  onKeywordChange: (evt: any) => void;
  showRefresh?: boolean;
  /**
   * 刷新方法
   */
  onRefresh?: () => void;
};

export default function CloudToolbar({
  fileCounts,
  keyword,
  onKeywordChange,
  showRefresh = true,
  onRefresh = () => { },
}: CloudToolbarProps) {
  return (
    <div className="cloud-panel">
      <div className="cloud-panel-left">
        {showRefresh ? (
          <SvgImg type={SvgIconEnum.CLOUD_REFRESH} style={{ cursor: 'pointer' }} onClick={onRefresh} />
        ) : null}
      </div>
      <div className="cloud-panel-right">
        <span style={{ minWidth: 60, marginRight: 10 }}>
          {fileCounts ? transI18n('cloud.fileCounts', { fileCounts }) : ''}
        </span>
        <Search
          prefix={<SvgImg type={SvgIconEnum.SEARCH} />}
          value={keyword}
          onSearch={onKeywordChange}
          inputPrefixWidth={32}
          placeholder={transI18n('scaffold.search')}
        />
      </div>
    </div>
  );
}
