export class HAApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getData(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/data`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return response.json() ;
  }

  async uploadFloorplan(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('floorplan', file);

    const response = await fetch(`${this.baseUrl}/api/floorplan/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload floorplan');
    }
    return response.json();
  }

  async saveConfig(config: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/config/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error('Failed to save config');
    }
    return response.json();
  }

  async callService(entity_id: string, service: string, serviceData?: any): Promise<any> {
    console.log("[TRACE] HAApiService ", entity_id, service, serviceData)
    const response = await fetch(`${this.baseUrl}/api/entities/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entity_id: entity_id,
        service: service,
        service_data: serviceData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to call service');
    }
    return response.json();
  }
}