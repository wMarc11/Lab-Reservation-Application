import { queryElement } from "./util/frontendUtil.js";

const accountJSON = sessionStorage.getItem("account");

if (accountJSON) {
    const account = JSON.parse(accountJSON);

    const dashboardLink = queryElement<HTMLLinkElement>('.sidebar a[href="dashboard.html"]');
    if (dashboardLink && account.accountType === "Admin") {
        dashboardLink.href = "dashboard-admin.html";
    }
}
