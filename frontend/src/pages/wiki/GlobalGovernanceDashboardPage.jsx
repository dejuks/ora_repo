import MainLayout from "../../components/layout/MainLayout";
import { governanceDashboardStats } from "../../mock/wikiGlobalGovernance.mock";

export default function GlobalGovernanceDashboardPage() {
  const stats = governanceDashboardStats;

  const cards = [
    { title: "Local Admins", value: stats.totalLocalAdmins, color: "primary", icon: "fas fa-user-shield" },
    { title: "Bots", value: stats.totalBots, color: "info", icon: "fas fa-robot" },
    { title: "Pending Promotions", value: stats.pendingPromotions, color: "success", icon: "fas fa-arrow-up" },
    { title: "Pending Demotions", value: stats.pendingDemotions, color: "warning", icon: "fas fa-arrow-down" },
    { title: "Rename Requests", value: stats.renameRequests, color: "secondary", icon: "fas fa-signature" },
    { title: "Locked Accounts", value: stats.lockedAccounts, color: "danger", icon: "fas fa-lock" },
    { title: "Small Communities", value: stats.activeSmallCommunities, color: "dark", icon: "fas fa-sitemap" },
    { title: "Policy Exceptions", value: stats.policyExceptions, color: "orange", icon: "fas fa-balance-scale" },
  ];

  return (
    <MainLayout>
      <section className="content">
        <div className="container-fluid mt-4">
          <h2 className="mb-4">Global Governance Dashboard</h2>

          <div className="row">
            {cards.map((card, idx) => (
              <div className="col-lg-3 col-md-6 mb-3" key={idx}>
                <div className={`small-box bg-${card.color}`}>
                  <div className="inner">
                    <h3>{card.value}</h3>
                    <p>{card.title}</p>
                  </div>
                  <div className="icon">
                    <i className={card.icon}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}