import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import DonationForm from '../components/DonationForm'
import { HelpRequestCategory, Urgency } from '@nx-mono-repo-deployment-test/shared/src/enums'

export default function DonatePage() {
  const router = useRouter()
  const { requestId, userName, category, urgency, items, location } = router.query

  // Parse items from the request
  const parseRequestItems = (itemsString: string): string[] => {
    if (!itemsString) return []
    // Parse items like "Food & Water (3), Torch (2), Medicine (1)"
    const itemsList: string[] = []
    const matches = itemsString.match(/([^,()]+)\((\d+)\)/g)
    if (matches) {
      matches.forEach((match) => {
        const itemName = match.split('(')[0].trim()
        itemsList.push(itemName)
      })
    } else {
      // Fallback: split by comma if no parentheses
      itemsString.split(',').forEach((item) => {
        const trimmed = item.trim()
        if (trimmed) itemsList.push(trimmed)
      })
    }
    return itemsList
  }

  // Map request category to donation items
  const getDonationItemsForCategory = (cat: string) => {
    const parsedItems = parseRequestItems(items as string)
    
    // Base items based on category
    const categoryItems: Record<string, Array<{ id: string; name: string; category: string }>> = {
      [HelpRequestCategory.FOOD_WATER]: [
        { id: '1', name: 'Clean Drinking Water', category: 'Essential Food & Water' },
        { id: '2', name: 'Ready-to-eat Packs', category: 'Essential Food & Water' },
        { id: '3', name: 'Canned Goods', category: 'Essential Food & Water' },
        { id: '4', name: 'Rice & Grain', category: 'Essential Food & Water' },
        { id: '5', name: 'Baby Formula', category: 'Essential Food & Water' },
        { id: '6', name: 'Dry Food Items', category: 'Essential Food & Water' },
      ],
      [HelpRequestCategory.MEDICAL]: [
        { id: '7', name: 'First Aid Kits', category: 'Medical Supplies' },
        { id: '8', name: 'Prescription Medicine', category: 'Medical Supplies' },
        { id: '9', name: 'Bandages & Dressings', category: 'Medical Supplies' },
        { id: '10', name: 'Antiseptics', category: 'Medical Supplies' },
        { id: '11', name: 'Pain Relievers', category: 'Medical Supplies' },
        { id: '12', name: 'Medical Equipment', category: 'Medical Supplies' },
      ],
      [HelpRequestCategory.SHELTER]: [
        { id: '13', name: 'Tents', category: 'Shelter & Housing' },
        { id: '14', name: 'Sleeping Bags', category: 'Shelter & Housing' },
        { id: '15', name: 'Blankets', category: 'Shelter & Housing' },
        { id: '16', name: 'Tarpaulins', category: 'Shelter & Housing' },
        { id: '17', name: 'Mattresses', category: 'Shelter & Housing' },
        { id: '18', name: 'Pillows', category: 'Shelter & Housing' },
      ],
      [HelpRequestCategory.RESCUE]: [
        { id: '19', name: 'Flashlights/Torches', category: 'Rescue Equipment' },
        { id: '20', name: 'Batteries', category: 'Rescue Equipment' },
        { id: '21', name: 'Ropes', category: 'Rescue Equipment' },
        { id: '22', name: 'Tools', category: 'Rescue Equipment' },
        { id: '23', name: 'Communication Devices', category: 'Rescue Equipment' },
      ],
    }

    // Get base items for category
    let donationItems = categoryItems[cat] || categoryItems[HelpRequestCategory.FOOD_WATER]

    // If parsed items exist, prioritize matching items
    if (parsedItems.length > 0) {
      const matchedItems = donationItems.filter((item) =>
        parsedItems.some((parsed) =>
          item.name.toLowerCase().includes(parsed.toLowerCase()) ||
          parsed.toLowerCase().includes(item.name.toLowerCase())
        )
      )
      if (matchedItems.length > 0) {
        donationItems = matchedItems
      }
    }

    return donationItems.map((item) => ({
      ...item,
      quantity: 0,
    }))
  }

  const requestDetails = {
    userName: (userName as string) || 'Anonymous',
    category: (category as string) || HelpRequestCategory.FOOD_WATER,
    urgency: (urgency as string) || Urgency.MEDIUM,
    location: (location as string) || 'Unknown',
    items: parseRequestItems(items as string),
    whenNeeded: 'As soon as possible',
  }

  return (
    <>
      <Head>
        <title>Make a Donation - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DonationForm
        userName={requestDetails.userName}
        requestDetails={{
          foods: requestDetails.items.length > 0 ? requestDetails.items : ['Various Items'],
          whenNeeded: requestDetails.whenNeeded,
          urgency: requestDetails.urgency,
        }}
        donationItems={getDonationItemsForCategory(requestDetails.category)}
        requestId={requestId as string}
      />
    </>
  )
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}
