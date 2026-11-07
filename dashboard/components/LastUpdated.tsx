export default function LastUpdated({ timestamp }: { timestamp: string | null }) {
  return (
    <div className="text-xs text-gray-500 mt-2">
      {timestamp ? `Last updated: ${new Date(timestamp).toLocaleString()}` : "Last updated: —"}
    </div>
  );
}
