export default function AnalyticsSection({ analytics }: { analytics: any }) {
  if (!analytics) return <div>Loading analytics...</div>;

  return (
    <div className="mt-4">
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-primary">{analytics.orderStats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-warning">{analytics.orderStats.pendingOrders}</h3>
              <p>Pending Orders</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="text-success">{analytics.orderStats.completedOrders}</h3>
              <p>Completed Orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Top Designs</h5>
            </div>
            <div className="card-body">
              {analytics.topDesigns.map((design: any, index: number) => (
                <div key={design._id} className="d-flex justify-content-between mb-2">
                  <span>{design._id}</span>
                  <span className="badge bg-primary">{design.count} orders</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Monthly Revenue</h5>
            </div>
            <div className="card-body">
              {analytics.revenueData.map((month: any) => (
                <div key={`${month._id.year}-${month._id.month}`} className="d-flex justify-content-between mb-2">
                  <span>{month._id.month}/{month._id.year}</span>
                  <span className="text-success">${month.revenue || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}