'use client';

import {
  CATEGORY_CLUSTERS,
  QUICK_TAGS,
  EMPTY_CATEGORY_FILTER,
  getClusterOfCategory,
  type CategoryFilterState,
} from '@/lib/constants';

const pill = (active: boolean) =>
  `px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
    active
      ? 'bg-slate-900 text-white shadow-2xs'
      : 'bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
  }`;

export function CategoryFilter({
  value,
  onChange,
}: {
  value: CategoryFilterState;
  onChange: (v: CategoryFilterState) => void;
}) {
  const cluster = CATEGORY_CLUSTERS.find((c) => c.id === value.cluster);
  const tags = QUICK_TAGS.filter((t) =>
    value.category !== 'Semua'
      ? t.category === value.category
      : cluster
        ? cluster.categories.some((c) => c.name === t.category)
        : true
  );

  const pickTag = (tag: string, category: string) => {
    if (value.tag === tag) return onChange({ ...value, tag: '' });
    onChange({ cluster: getClusterOfCategory(category) ?? 'Semua', category, tag });
  };

  const pickCategory = (name: string) => {
    const tagCat = QUICK_TAGS.find((x) => x.tag === value.tag)?.category;
    onChange({ ...value, category: name, tag: tagCat && name !== 'Semua' && tagCat !== name ? '' : value.tag });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
          Sektor:
        </span>
        <button
          type="button"
          className={pill(value.cluster === 'Semua')}
          onClick={() => onChange(EMPTY_CATEGORY_FILTER)}
        >
          Semua
        </button>
        {CATEGORY_CLUSTERS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={pill(value.cluster === c.id)}
            onClick={() => onChange({ cluster: c.id, category: 'Semua', tag: '' })}
          >
            {c.label}
          </button>
        ))}
      </div>

      {cluster && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Kategori:
          </span>
          <button
            type="button"
            className={pill(value.category === 'Semua')}
            onClick={() => pickCategory('Semua')}
          >
            Semua
          </button>
          {cluster.categories.map((c) => (
            <button
              key={c.name}
              type="button"
              className={pill(value.category === c.name)}
              onClick={() => pickCategory(c.name)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
          Tag:
        </span>
        {tags.map(({ tag, category }) => (
          <button
            key={tag}
            type="button"
            className={pill(value.tag === tag)}
            onClick={() => pickTag(tag, category)}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}
