import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PageLayout } from '@/components/ui/page-layout'

const formSchema = z.object({
    title: z.string(),
    description: z.string(),
    labelInputField: z.string(),
    buttonText: z.string(),
    helpText: z.string(),
    errorMessage: z.string()
})

export default function ProjectAuthenticationUniqueCode() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    return(
        <div>
            <PageLayout
            pageHeader="Projecten"
            breadcrumbs={[
                {
                    name: 'Projecten',
                    url: '/projects',
                },
                {
                    name: 'Authenticatie',
                    url: '/projects/1/authentication'
                },
                {
                    name: 'Unieke code',
                    url: '/projects/1/authentication/uniquecode'
                }
            ]}>
            <div className="container mx-auto py-10 w-1/2 float-left divide-y">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Titel</FormLabel>
                                <FormControl>
                                    <Input placeholder='' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descriptie</FormLabel>
                                <FormControl>
                                    <Textarea placeholder='' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="labelInputField"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Label voor inputvelden</FormLabel>
                                <FormControl>
                                    <Input placeholder='' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="buttonText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Button Text</FormLabel>
                                <FormControl>
                                    <Input placeholder='' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="helpText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hulptext</FormLabel>
                                <FormControl>
                                    <Textarea placeholder='' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="errorMessage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Error melding</FormLabel>
                                <FormControl>
                                    <Textarea placeholder='' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" variant={"default"}>Opslaan</Button>
                    </form>
                    <br/>
                </Form>
            </div>
            </PageLayout>
            </div>
    )
}