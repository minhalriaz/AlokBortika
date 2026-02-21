const STORAGE_KEY = "alokbortika_reports";

export function loadReports() {
  try {
    const storedReports = localStorage.getItem(STORAGE_KEY);
    if (!storedReports) {
      return [];
    }
    const parsedReports = JSON.parse(storedReports);
    return Array.isArray(parsedReports) ? parsedReports : [];
  } catch (error) {
    return [];
  }
}

export function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function createReport(reportInput) {
  const report = {
    id: Date.now(),
    title: reportInput.title.trim(),
    category: reportInput.category.trim(),
    location: reportInput.location.trim(),
    description: reportInput.description.trim(),
    status: "Pending",
    submittedAt: new Date().toISOString(),
  };

  const existingReports = loadReports();
  const updatedReports = [report, ...existingReports];
  saveReports(updatedReports);
  return report;
}
