import { Construct } from "constructs";
import { App, TerraformStack,TerraformOutput } from "cdktf";
import {  AppService,  AppServicePlan,  AzurermProvider,  ResourceGroup} from './.gen/providers/azurerm';


class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // define resources here

    new AzurermProvider(this, "AzureRM", {
      features: [{}],
    });

    const rg = new ResourceGroup(this, "rg2", {
      name: "rg2",
      location: "eastus",
    });

    const plan = new AppServicePlan(this, "servicePlan", {
      kind: "Windows",
      resourceGroupName: rg.name,
      location: rg.location,
      name: "cdkforTerraformApp",
      sku: [{ size: "F1", tier: "Free" }],
      dependsOn: [rg],
    });

    const service = new AppService(this, "service", {
      name: "appservice-cdktf",
      appServicePlanId: `${plan.id}`,
      location: rg.location,
      resourceGroupName: rg.name,
      dependsOn: [plan],
    });
    new TerraformOutput(this, "appweburl", {
      value: `https://${service.name}.azurewebsites.net/`,
    });

  }

}
const app = new App();
new MyStack(app, "terrcdk-azure");
app.synth();
