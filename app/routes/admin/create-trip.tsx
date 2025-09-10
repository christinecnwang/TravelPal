import { Header } from "components";
import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import type { Route } from "./+types/create-trip";
import CountryFlag from "react-country-flag";
import { comboBoxItems, selectItems } from "~/constants";
import { cn, formatKey } from "lib/utils";
import { LayerDirective, LayersDirective, MapsComponent } from "@syncfusion/ej2-react-maps";
import { useState } from "react";
import { world_map } from "~/constants/world_map";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { account } from "~/appwrite/client";
import { useNavigate } from "react-router";

export const loader = async () => {
    const response = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,cca2,latlng,maps"
    );
    const data = await response.json();

    return data.map((country: any) => ({
        name: country.name.common,
        coordinates: country.latlng,
        value: country.name.common,
        cca2: country.cca2,
        openStreetMap: country.maps?.openStreetMap,
    }));
};

const countryTemplate = (data: any) => (
    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <CountryFlag
            countryCode={data.cca2}
            svg
            style={{ width: "1.5em", height: "1.5em" }}
        />
        {data.text}
    </span>
);

const CreateTrips = ({ loaderData }: Route.ComponentProps) => {

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true);
        if (
            !formData.country ||
            !formData.travelStyle ||
            !formData.interest ||
            !formData.budget ||
            !formData.groupType
        ) {
            setError("Please provide values for all fields")
            setLoading(false)
            return;
        }
        if (formData.duration < 1 || formData.duration > 10) {
            setError('Duration must be between 1 and 10 days');
            setLoading(false)
            return;
        }
        const user = await account.get();
        if (!user.$id) {
            console.error('User not authenticated');
            setLoading(false)
            return;
        }

        try {
            console.log('user', user);
            console.log('formData', formData);

        } catch (e) {
            console.error('Error generating trip', e);

        } finally {
            setLoading(false)
        }


    };



    const handleChange = (key: keyof TripFormData, value: string | number) => {

        setFormData({ ...formData, [key]: value })
    }
    const countries = loaderData as Country[];
    const navigate = useNavigate();

    const countryData = countries.map((country: any) => ({
        text: country.name,
        value: country.value,
        cca2: country.cca2,
    }));

    const [formData, setFormData] = useState<TripFormData>({
        country: countries[0]?.name || '',
        travelStyle: '',
        interest: '',
        budget: '',
        duration: 0,
        groupType: ''
    })

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const mapData = [
        {
            country: formData.country,
            color: '#EA382E',
            coordinates: countries.find((c: Country) => c.name === formData.country)?.coordinates || []
        }
    ]

    return (
        <main className='flex flex-col gap-10 pb-20 wrapper'>
            <Header
                title='Add a New Trip'
                description='View and edit AI Generated travel plans'
            />
            <section className='mt-2.5 wrapper=md'>
                <form className='trip-form' onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='country'>Country</label>
                        <ComboBoxComponent
                            id='country'
                            dataSource={countryData}
                            fields={{ text: "text", value: "value" }}
                            placeholder='Select a Country'
                            itemTemplate={countryTemplate}
                            className='combo-box'
                            change={(e: { value: string | undefined }) => {
                                if (e.value) {
                                    handleChange('country', e.value)
                                }
                            }}
                            allowFiltering
                            filtering={(e) => {
                                const query = e.text.toLowerCase();
                                e.updateData(
                                    countries.filter((country) =>
                                        country.name.toLowerCase().includes(query)).map(((country: any) => ({
                                            text: country.name,
                                            value: country.value,
                                            cca2: country.cca2
                                        })))
                                )
                            }}
                        />
                    </div>
                    <div>
                        <label htmlFor="duration"> Duration</label>
                        <input
                            id="duration"
                            name="duration"
                            placeholder="Enter a number of days (5,12 ...)"
                            className="form-input placeholder:text-gray-100"
                            onChange={(e) => handleChange('duration', Number(e.target.value))}
                        />
                    </div>
                    {selectItems.map((key) => (
                        <div key={key}>
                            <label htmlFor={key}>{formatKey(key)}</label>
                            <ComboBoxComponent
                                id={key}
                                dataSource={comboBoxItems[key].map((item) => ({
                                    text: item,
                                    value: item,
                                }))}
                                fields={{ text: 'text', value: 'value' }}
                                placeholder={`Select ${formatKey(key)}`}
                                change={(e: { value: string | undefined }) => {
                                    if (e.value) {
                                        handleChange(key, e.value)
                                    }
                                }}
                                allowFiltering
                                filtering={(e) => {
                                    const query = e.text.toLowerCase();
                                    e.updateData(
                                        comboBoxItems[key].filter((item: any) =>
                                            item.name.toLowerCase().includes(query)).map(((item: any) => ({
                                                text: item.name,
                                                value: item.value,
                                            }))))
                                }}
                                className="combo-box"
                            />
                        </div>
                    ))}
                    <div>
                        <label htmlFor="location">
                            Location on the world map
                        </label>
                        <MapsComponent>
                            <LayersDirective>
                                <LayerDirective
                                    shapeData={world_map}
                                    dataSource={mapData}
                                    shapePropertyPath="name"
                                    shapeDataPath="country"
                                    shapeSettings={{ colorValuePath: "color", fill: "#E5E5E5" }}
                                />
                            </LayersDirective>
                        </MapsComponent>
                    </div>
                    <div className="bg-gray-200 h-px w-full" />

                    {error && (
                        <div className="error">
                            <p>{error}</p>
                        </div>
                    )}
                    <footer className="px-6 w-full">
                        <ButtonComponent type="submit"
                            className="button-class !h-12 !w-full" disabled={loading}
                        >
                            <img src={`/assets/icons/${loading ? 'loader.svg' : 'magic-star.svg'}`} className={cn("size-5", { 'animate-spin': loading })} />
                            <span className="p-16-semibold text-white">
                                {loading ? 'Generating...' : 'Generate Trip'}
                            </span>
                        </ButtonComponent>
                    </footer>
                </form>
            </section>
        </main>
    );
};

export default CreateTrips;