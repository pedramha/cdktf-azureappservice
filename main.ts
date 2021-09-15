import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import {  AppService,  AppServicePlan,  AzurermProvider,  ResourceGroup} from './.gen/providers/azurerm';


class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // define resources here

    new AzurermProvider(this, "AzureRM", {
      features: [{}],
    });

    const rg = new ResourceGroup(this, "rg-eastus", {
      name: "rg-eastus",
      location: "eastus",
    });

    const plan = new AppServicePlan(this, "servicePlan", {
      kind: "Windows",
      resourceGroupName: rg.name,
      location: rg.location,
      name: "cdkforTerraformApp",
      sku: [{ size: "B1", tier: "Standard" }],
      dependsOn: [rg],
    });

    const service = new AppService(this, "service", {
      name: "appservice-cdktf",
      appServicePlanId: `${plan.id}`,
      location: rg.location,
      resourceGroupName: rg.name,
      dependsOn: [plan],
    });
    const imagename = "nginx:latest";
    service.addOverride("site_config", [
      {
        linux_fx_version: `DOCKER|${imagename}`,
        use_32_bit_worker_process: true,
      },
    ]);
  
  }
}
const app = new App();
new MyStack(app, "terrcdk-azure");
app.synth();
