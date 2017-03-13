import { UISchemaElement } from './models/uischema';
import { DataService, JsonFormService, JsonFormsHolder } from './core';
import { JsonSchema } from './models/jsonSchema';
import { generateDefaultUISchema } from './generators/ui-schema-gen';
import { generateJsonSchema } from './generators/schema-gen';

interface CustomElementConfig {
  selector: string;
}
const CustomElement = (config: CustomElementConfig) => (cls) =>
    customElements.define(config.selector, cls);

@CustomElement({
  selector: 'json-forms'
})
export class JsonForms extends HTMLElement {
  private allowDynamicUpdate = false;
  dataService: DataService;
  uischema: UISchemaElement;
  dataschema: JsonSchema;
  private services: Array<JsonFormService> = [];
  dataObject: any;

  constructor() {
    super();
  }

  connectedCallback(): void {
    this.allowDynamicUpdate = true;
    this.render();
  }

  disconnectedCallback(): void {
    this.services.forEach(service => service.dispose());
  }

  private render(): void {

    if (this.dataObject == null || this.dataService == null) {
      return;
    }

    if (this.lastChild !== null) {
      this.removeChild(this.lastChild);
    }

    this.services.forEach(service => service.dispose());
    this.services = [];
    const schema = this.dataSchema;
    const uiSchema = this.uiSchema;
    this.createServices(uiSchema, schema);

    const bestRenderer = JsonFormsHolder.rendererService
        .getBestRenderer(uiSchema, schema, this.dataService);
    this.appendChild(bestRenderer);

    this.dataService.initialRootRun();
  }

  set data(data: Object) {
    this.dataObject = data;
    this.dataService = new DataService(data);
    this.render();
  }

  set uiSchema(uischema: UISchemaElement) {
    this.uischema = uischema;
    this.render();
  }

  set dataSchema(dataschema: JsonSchema) {
    this.dataschema = dataschema;
    this.render();
  }

  get dataSchema() {
    if (this.dataschema) {
      return this.dataschema;
    }
    return generateJsonSchema(this.dataObject);
  }

  get uiSchema() {
    if (this.uischema) {
      return this.uischema;
    }
    return generateDefaultUISchema(this.dataSchema);
  }

  private createServices(uiSchema, dataSchema): void {
    JsonFormsHolder.jsonFormsServices.forEach(service =>
        this.services.push(new service(this.dataService, dataSchema, uiSchema))
    );
  }
}