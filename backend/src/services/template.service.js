import { TEMPLATE_META, makeChartSeries } from "../constants/templates.js";
import { ZKProof } from "../models/ZKProof.js";

export function getTemplateMeta(templateType) {
  const meta = TEMPLATE_META[templateType];
  if (!meta) throw Object.assign(new Error(`Unknown templateType: ${templateType}`), { statusCode: 400 });
  return meta;
}

export async function buildDashboardPayload(project) {
  const meta = getTemplateMeta(project.templateType);
  const proofs = await ZKProof.find({ projectId: project._id }).sort({ createdAt: -1 });
  return {
    project: project.toClientJSON(),
    templateType: project.templateType,
    meta: {
      pageTitle: meta.pageTitle,
      label: meta.label,
      metricTitles: meta.metricTitles,
      metricValues: meta.metricValues,
      chartTitle: meta.chartTitle,
      chartSubtitle: meta.chartSubtitle,
      chartType: meta.chartType,
      assetUnit: meta.assetUnit,
      protocol: meta.protocol,
    },
    chartSeries: makeChartSeries(meta.seed, meta.chartType),
    proofs: proofs.map((p) => p.toClientJSON()),
  };
}
