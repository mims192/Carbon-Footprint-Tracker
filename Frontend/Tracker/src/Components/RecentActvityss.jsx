export default function RecentActivityss({ activities }) {
  return (
    <div className="space-y-4">
      {activities.map(a => (
        <div key={a._id} className="p-4 bg-slate-700 rounded flex justify-between">
          <div>
            <div className="font-semibold">{a.category}</div>
            <div className="text-sm text-slate-300">{new Date(a.createdAt).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{a.details?.co2_kg || a.co2_kg} kg CO₂</div>
            <div className="text-green-400">+{a.details?.points || a.points} pts</div>
          </div>
        </div>
      ))}
    </div>
  );
}


